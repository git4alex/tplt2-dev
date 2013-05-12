package org.delta.system.export;

import org.delta.core.utils.ValueMap;
import org.delta.system.service.BizCodeService;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.hssf.usermodel.*;
import org.springframework.web.servlet.view.document.AbstractExcelView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.Map;

/**
 * date: 2011-8-4
 * <p/>
 * version: 1.0 commonts: ......
 */
public class ExcelView extends AbstractExcelView {
    protected void buildExcelDocument(Map model, HSSFWorkbook workbook, HttpServletRequest request, HttpServletResponse response)
            throws Exception {

        ValueMap data = (ValueMap) model.get("data");
        String id = MapUtils.getString(data, "id");
        List<Map<String, String>> cols = (List<Map<String, String>>) MapUtils.getObject(data, "cols");

        HSSFSheet sheet = workbook.createSheet("数据");
        try {
            ValueMap map = (ValueMap) ExportCatch.getAndRemove(id);
            List<ValueMap> rows = (List<ValueMap>) map.get("root");

            HSSFCellStyle style = workbook.createCellStyle();
            style.setFillForegroundColor((short) 13);// 设置背景色
            style.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);

            // excel表头（2003）
            HSSFRow titleRow = sheet.createRow(0);
            for (int x = 0; x < cols.size(); x++) {
                HSSFCell cell = titleRow.createCell(x);

                Map<String, String> col = cols.get(x);
                cell.setCellValue(col.get("title"));
                cell.setCellStyle(style);
            }

            for (int y = 0; y < rows.size(); y++) {
                ValueMap rowData = rows.get(y);
                HSSFRow row = sheet.createRow(y + 1);
                for (int x = 0; x < cols.size(); x++) {
                    HSSFCell cell = row.createCell(x);

                    Map<String, String> col = cols.get(x);
                    String code = MapUtils.getString(col, "code");
                    String value = MapUtils.getString(rowData, code);

                    String bizCode = MapUtils.getString(col, "bizCode");
                    if (StringUtils.isNotBlank(bizCode)) {
                        value = BizCodeService.getBizName(bizCode, value);
                    }
                    cell.setCellValue(value);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);
        }
    }
}
