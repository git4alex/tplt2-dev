package org.delta.utils;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonParser.Feature;
import org.codehaus.jackson.map.ObjectMapper;
import org.delta.core.dao.OrderBy;
import org.delta.core.entity.service.EntityService;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.MetadataConst;
import org.delta.core.utils.ValueMap;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.util.Assert;

import java.io.IOException;
import java.lang.reflect.Array;
import java.sql.Types;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * date: 2011-1-30
 * <p/>
 * version: 1.0 commonts: ......
 */
public class TpltUtils {
    public static Logger logger = Logger.getLogger(TpltUtils.class);

    private final static String[] CN_Digits = {"零", "壹", "貳", "叁", "肆", "伍", "陆", "柒", "捌", "玖",};

    /**
     * 将阿拉伯数字转成中文大写
     *
     * @param moneyValue 要转的数字
     * @return 中文大写
     */
    public static String convertDigits(String moneyValue) {
        // 使用正则表达式，去除前面的零及数字中的逗号
        String value = moneyValue.replaceFirst("^0+", "");
        value = value.replaceAll(",", "");
        // 分割小数部分与整数部分
        int dot_pos = value.indexOf('.');
        String int_value;
        String fraction_value;
        if (dot_pos == -1) {
            int_value = value;
            fraction_value = "00";
        } else {
            int_value = value.substring(0, dot_pos);
            fraction_value = value.substring(dot_pos + 1, value.length()) + "00".substring(0, 2);// 也加两个0，便于后面统一处理
        }

        int len = int_value.length();
        if (len > 16) {
            return "要转换的数字过大";
        }
        StringBuilder cn_currency = new StringBuilder();
        String[] CN_Carry = new String[]{"", "万", "亿", "万"};
        // 数字分组处理，计数组数
        int cnt = len / 4 + (len % 4 == 0 ? 0 : 1);
        // 左边第一组的长度
        int partLen = len - (cnt - 1) * 4;
        String partValue = null;
        boolean bZero = false;// 有过零
        String curCN = null;
        for (int i = 0; i < cnt; i++) {
            partValue = int_value.substring(0, partLen);
            int_value = int_value.substring(partLen);
            curCN = Part2CN(partValue, i != 0 && !"零".equals(curCN));
            // 若上次为零，这次不为零，则加入零
            if (bZero && !"零".equals(curCN)) {
                cn_currency.append("零");
                bZero = false;
            }
            if ("零".equals(curCN))
                bZero = true;
            // 若数字不是零，加入中文数字及单位
            if (!"零".equals(curCN)) {
                cn_currency.append(curCN);
                cn_currency.append(CN_Carry[cnt - 1 - i]);
            }
            // 除最左边一组长度不定外，其它长度都为4
            partLen = 4;
            partValue = null;
        }
        cn_currency.append("元");
        // 处理小数部分
        int fv1 = Integer.parseInt(fraction_value.substring(0, 1));
        int fv2 = Integer.parseInt(fraction_value.substring(1, 2));
        if (fv1 + fv2 == 0) {
            cn_currency.append("整");
        } else {
            cn_currency.append(CN_Digits[fv1]).append("角");
            cn_currency.append(CN_Digits[fv2]).append("分");
        }
        return cn_currency.toString();
    }

    private static String Part2CN(String partValue, boolean bInsertZero) {
        // 使用正则表达式，去除前面的0
        partValue = partValue.replaceFirst("^0+", "");
        int len = partValue.length();
        if (len == 0)
            return "零";
        StringBuilder sbResult = new StringBuilder();
        int digit;
        String[] CN_Carry = new String[]{"", "拾", "佰", "仟"};
        for (int i = 0; i < len; i++) {
            digit = Integer.parseInt(partValue.substring(i, i + 1));
            if (digit != 0) {
                sbResult.append(CN_Digits[digit]);
                sbResult.append(CN_Carry[len - 1 - i]);
            } else {
                // 若不是最后一位，且下不位不为零，追加零
                if (i != len - 1 && Integer.parseInt(partValue.substring(i + 1, i + 2)) != 0)
                    sbResult.append("零");
            }
        }
        if (bInsertZero && len != 4)
            sbResult.insert(0, "零");
        return sbResult.toString();
    }

    public static boolean isContains(Enum[] c, Enum e) {
        if (c == null || e == null)
            return false;

        for (Enum c1 : c) {
            if (c1 == e) {
                return true;
            }
        }

        return false;
    }

    public static <T> T[] removeDuplicate(T[] objs, Class<T> componentType) {
        if (ArrayUtils.isEmpty(objs)) {
            return objs;
        }
        Set<Object> set = new HashSet<Object>();
        set.addAll(Arrays.asList(objs));
        T[] t = (T[]) Array.newInstance(componentType, 0);
        return set.toArray(t);
    }

    public static Date getDate(String billDateStr, String dateFormat) throws BusinessException {
        try {
            SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);
            return sdf.parse(billDateStr);
        } catch (ParseException e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);

            throw new BusinessException("时间格式有误");
        }
    }

    public static OrderBy refactorOrderByParams(Map parameter) throws BusinessException {
        String sort = MapUtils.getString(parameter, "sort");
        String dir = MapUtils.getString(parameter, "dir", "asc");

        String[] fields = StringUtils.split(sort, ",");
        if (ArrayUtils.isEmpty(fields)) {
            return null;
        }

        OrderBy ret = new OrderBy();
        for (String f : fields) {
            if (dir.equalsIgnoreCase("desc")) {
                ret.desc(f);
            } else {
                ret.asc(f);
            }
        }

        parameter.remove("sort");
        parameter.remove("dir");

        return ret;
    }

    public static List refactorQueryParams(Map parameter) throws BusinessException {
        parameter.remove("_dc");
        List list = null;
        if(MapUtils.isNotEmpty(parameter)){
            String params = MapUtils.getString(parameter, "queryParams");

            if(StringUtils.isNotBlank(params)){
                try {
                    list = new ObjectMapper().configure(Feature.ALLOW_UNQUOTED_FIELD_NAMES, true).readValue(params,List.class);
                } catch (IOException e) {
                    throw new BusinessException("读取queryParams中的参数出错");
                }
                parameter.remove("queryParams");
            }

            if(MapUtils.isNotEmpty(parameter)){
                if(list == null){
                    list = new ArrayList();
                }

                for (Object key : parameter.keySet()) {
                    Object value = parameter.get(key);
                    ValueMap map = new ValueMap();
                    map.put(EntityService.FIELD_CODE_KEY, key);
                    map.put(EntityService.OPERATOR_KEY, "in");
                    map.put(EntityService.VALUE_KEY, value);

                    list.add(map);
                }
            }
        }

        return list;
    }

//    public static List<ValueMap> refactorQueryParams(Map requestParam) throws BusinessException {
//        try {
//            List<ValueMap> list = new ArrayList<ValueMap>();
//            ValueMap params = (ValueMap) request.getParameterMap();
//            for (Entry<String, Object> entry : params.entrySet()) {
//                String key = entry.getKey();
//                Object value = entry.getValue();
//
//                ValueMap map = new ValueMap();
//                map.put(EntityService.FIELD_CODE_KEY, key);
//                map.put(EntityService.OPERATOR_KEY, "in");
//                map.put(EntityService.VALUE_KEY, value);
//                list.add(map);
//            }
//            return list;
//        } catch (Exception e) {
//            e.printStackTrace();
//            logger.error(e.getMessage(), e);
//            throw new BusinessException("parameter error");
//        }
//    }

//    public static List<ValueMap> readExcel(File file, int sheetIndex, EntityMetadata entityMetadata, boolean isCheck,
//                                           Integer returnRows) throws BusinessException {
//        if (!file.getName().endsWith("xls") && !file.getName().endsWith("xlsx")) {
//            throw new BusinessException("要读取的文件非Excel文件");
//        }
//        List<FieldMetadata> fieldList = entityMetadata.getFields();
//        for (FieldMetadata fieldMetadata : fieldList) {
//            if (fieldMetadata.getCode().equals(entityMetadata.getPkCode())) {
//                fieldList.remove(fieldMetadata);
//                break;
//            }
//        }
//
//        InputStream inputStream = null;
//        List<ValueMap> datas = new ArrayList<ValueMap>();
//        try {
//            inputStream = new FileInputStream(file);
//            Workbook book = null;
//            // excel 2003
//            if (file.getName().endsWith("xls")) {
//                book = new HSSFWorkbook(inputStream);
//            } else {
//                // excel 2007
//                book = new XSSFWorkbook(inputStream);
//            }
//            if (book.getNumberOfSheets() - 1 < sheetIndex) {
//                throw new BusinessException("sheet" + sheetIndex + "不存在");
//            }
//            Sheet sheet = book.getSheetAt(sheetIndex);
//            if (isCheck) {
//                Iterator<Row> rows = sheet.iterator();
//                while (rows.hasNext()) {
//                    Row row = rows.next();
//                    new ValueMap();
//                    if (row == null) {
//                        throw new BusinessException(sheet.getSheetName() + "的第 " + row.getRowNum() + " 行没有数据");
//                    }
//                    int cellIndex = 0;
//                    for (FieldMetadata metadata : fieldList) {
//                        // data.put(metadata.getCode(), row.getCell(cellIndex));
//                        if (metadata.getBizTypeCode() != null) {
//                            BizCodeService.getBizName(metadata.getBizTypeCode(), row.getCell(cellIndex).toString());
//                        }
//                        cellIndex++;
//                    }
//                    // datas.add(data);
//                }
//            }
//
//            if (returnRows != null) {
//                for (int i = 1; i <= returnRows; i++) {
//                    ValueMap data = new ValueMap();
//                    Row row = sheet.getRow(i);
//                    if (row == null) {
//                        throw new BusinessException(sheet.getSheetName() + "的第" + i + "行没有数据");
//                    }
//                    int cellIndex = 0;
//                    for (FieldMetadata metadata : fieldList) {
//                        data.put(metadata.getCode(), getCellValue(metadata, row.getCell(cellIndex)));
//                        if (metadata.getBizTypeCode() != null) {
//                            String bizText = BizCodeService.getBizName(metadata.getBizTypeCode(),
//                                    row.getCell(cellIndex) != null ? row.getCell(cellIndex) + "" : "");
//                            data.put(metadata.getCode() + "Text", bizText);
//                        }
//                        cellIndex++;
//                    }
//                    datas.add(data);
//
//                }
//            } else {
//                int rowLength = sheet.getPhysicalNumberOfRows();
//                for (int i = 1; i < rowLength; i++) {
//                    Row row = sheet.getRow(i);
//                    ValueMap data = new ValueMap();
//                    if (row == null) {
//                        throw new BusinessException(sheet.getSheetName() + "的第 " + row.getRowNum() + " 行没有数据");
//                    }
//                    int cellIndex = 0;
//                    for (FieldMetadata metadata : fieldList) {
//                        data.put(metadata.getCode(), getCellValue(metadata, row.getCell(cellIndex)));
//                        if (metadata.getBizTypeCode() != null) {
//                            String bizText = BizCodeService.getBizName(metadata.getBizTypeCode(),
//                                    row.getCell(cellIndex) != null ? row.getCell(cellIndex) + "" : "");
//                            data.put(metadata.getCode() + "Text", bizText);
//                        }
//                        cellIndex++;
//                    }
//                    datas.add(data);
//                }
//            }
//
//        } catch (FileNotFoundException e) {
//            throw new BusinessException(file.getName() + "不存在");
//        } catch (Exception ex) {
//            ex.printStackTrace();
//        } finally {
//            try {
//                if (inputStream != null) {
//                    inputStream.close();
//                }
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
//        }
//        return datas;
//    }
//
//    private static Object getCellValue(FieldMetadata field, Cell cell) {
//        if (cell == null) {
//            return "";
//        }
//        if (cell.getCellType() == Cell.CELL_TYPE_NUMERIC) {
//            if (field.getDataType().equals("float")) {
//                return cell.getNumericCellValue();
//            } else if (field.getDataType().equals("timestamp")) {
//                return cell.getDateCellValue();
//            } else {
//                return (int) cell.getNumericCellValue();
//            }
//        } else {
//            return cell.getStringCellValue();
//        }
//    }

    public static MetadataConst.DataType getSystemDataType(int sqlType) {
        if (sqlType == Types.FLOAT || sqlType == Types.REAL || sqlType == Types.DOUBLE || sqlType == Types.NUMERIC
                || sqlType == Types.DECIMAL) { // 数字（小数）

            return MetadataConst.DataType.DATATYPE_FLOAT;
        } else if (sqlType == Types.TINYINT || sqlType == Types.SMALLINT || sqlType == Types.INTEGER || sqlType == Types.BIGINT) { // 数字（整数）

            return MetadataConst.DataType.DATATYPE_INTEGER;
        } else if (sqlType == Types.BOOLEAN) {
            return MetadataConst.DataType.DATATYPE_BOOLEAN;
        } else if (sqlType == Types.DATE || sqlType == Types.TIME || sqlType == Types.TIMESTAMP) { // 日期

            return MetadataConst.DataType.DATATYPE_TIMESTAMP;
        } else {

            return MetadataConst.DataType.DATATYPE_STRING;
        }
    }

    public static boolean isCollection(Object o){
        if(o == null){
            return false;
        }

        if(o instanceof Collection){
            return true;
        }

        if(o.getClass().isArray()){
            return true;
        }

        return false;
    }

    public static String getAuthenticatedUserId(){
        UserDetails ud = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Assert.notNull(ud,"authenticated user is null");

        return ud.getUsername();
    }
}
