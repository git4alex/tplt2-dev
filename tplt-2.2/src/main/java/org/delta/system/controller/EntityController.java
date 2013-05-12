package org.delta.system.controller;

import org.delta.core.dao.Filter;
import org.delta.core.dao.OrderBy;
import org.delta.core.dao.Page;
import org.delta.core.entity.service.EntityService;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.EntityMetadata;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.ValueMap;
import org.delta.system.Result;
import org.delta.utils.TpltUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * date: 2010-7-20
 * <p/>
 * version: 1.0 commonts: ......
 */
@Controller
@RequestMapping(value = "/entity", headers="X-Requested-With=XMLHttpRequest")
public class EntityController {
    private static Logger logger = Logger.getLogger(EntityController.class);

    @Resource
    private EntityService entityService;
    @Resource
    private MetadataProvider metadataProvider;

    @RequestMapping(value = "/{entityCode}", method = RequestMethod.GET)
    @ResponseBody
    public Result list(@PathVariable String entityCode, @RequestParam Map requestParam, HttpServletRequest request) {
        Filter filter = Filter.emptyFilter();
        int start = -1, limit = -1;
        OrderBy orderBy = null;
        if (MapUtils.isNotEmpty(requestParam)) {
            start = MapUtils.getInteger(requestParam, "start", -1);
            requestParam.remove("start");
            limit = MapUtils.getInteger(requestParam, "limit", -1);
            requestParam.remove("limit");
            orderBy = TpltUtils.refactorOrderByParams(requestParam);
            List queryParams = TpltUtils.refactorQueryParams(requestParam);
            filter = entityService.createFilter(entityCode, queryParams);
        }
        if (start > 0 && limit > 0) {
            Page page = entityService.page(entityCode, filter, orderBy, start, limit);
            return Result.list(page);
        } else {
            return Result.list(entityService.list(entityCode, filter, orderBy));
        }
    }

    @RequestMapping(value = "/{entityCode}/{id}", method = RequestMethod.GET)
    @ResponseBody
    public Result get(@PathVariable String entityCode, @PathVariable String id) {
        return Result.data(entityService.getById(entityCode, id));
    }

    @RequestMapping(value = "/{entityCode}", method = RequestMethod.POST)
    @ResponseBody
    public Result create(@PathVariable final String entityCode, @RequestBody final ValueMap data) {
        ValueMap entity = entityService.create(entityCode, data);
        return Result.data(entity);
    }

    @RequestMapping(value = "/batch/{entityCode}", method = RequestMethod.POST)
    @ResponseBody
    public Result batchCreate(@PathVariable final String entityCode, @RequestBody final List<HashMap> vs) {
        List<ValueMap> rs = entityService.create(entityCode, vs);
        return Result.success();
    }

    @RequestMapping(value = "/{entityCode}/{id}", method = RequestMethod.PUT)
    @ResponseBody
    public Result update(@PathVariable String entityCode, @PathVariable String id, @RequestBody ValueMap data) {
        ValueMap entity = entityService.updateById(entityCode, id, data);
        return Result.data(entity);
    }

    @RequestMapping(value = "/{entityCode}/{id}", method = RequestMethod.DELETE)
    @ResponseBody
    public Result delete(@PathVariable final String entityCode, @PathVariable final String id) {
        entityService.deleteById(entityCode, id);
        return Result.message("删除成功");
    }

    @RequestMapping(value = "/{entityCode}", method = RequestMethod.DELETE)
    @ResponseBody
    public Result delete(@PathVariable final String entityCode, @RequestBody final Map<String, Object> params) {
        String idsStr = MapUtils.getString(params, "ids");
        if (StringUtils.isBlank(idsStr)) {
            throw new BusinessException("获取ids参数失败");
        }
        String[] ids = idsStr.split(",");
        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        String pkCode = metadata.getPkCode();
        entityService.delete(entityCode,Filter.field(pkCode).in(ids));
        return Result.success();
    }

//    @RequestMapping(value = "/export/{entityCode}", method = RequestMethod.GET)
//    public ModelAndView export(@PathVariable String entityCode, @RequestParam Map parameter, HttpServletRequest request) {
//        Map<String, Object> data = new HashMap<String, Object>();
//        try {
//            // OrderBy orderBy = refactorOrderByParams(requestParam);
//            // List<Map<String,Object>> list = refactorQueryParams(requestParam);
//            // List<Integer> idsList = (List<Integer>)
//            // MapUtils.getObject(requestParam, "ids");
//            String[] idsStr = MapUtils.getString(parameter, "ids").split(",");
//            String[] fieldCodes = MapUtils.getString(parameter, "fieldCodes").split(","); // 实体属性
//            Integer[] ids = new Integer[idsStr.length];
//            int i = 0;
//            for (String id : idsStr) {
//                ids[i] = Integer.parseInt(id);
//                i++;
//            }
//
//            Map<String, Object> where = new HashMap<String, Object>();
//            where.put("id", ids);
//
//            EntityMetadata metadata = metadataProvider.getEntityMetadataFromDb(entityCode);
//            List<Map<String, Object>> dataList = entityService.list(metadata, where, null, SessionUtils.getUser(request));
//            data.put("dataList", dataList);
//            data.put("titles", metadata.getColumnTitles(fieldCodes));
//            data.put("fieldCodes", fieldCodes);
//        } catch (Exception e) {
//            e.printStackTrace();
//            logger.error(e.getMessage(), e);
//        }
//        return new ModelAndView("excelView", "data", data);
//    }

//    @RequestMapping(value = "/upload/{code}", method = RequestMethod.POST)
//    public Map<String, Object> upload(@PathVariable final EntityCode code, @RequestParam() final MultipartFile file,
//            @RequestParam final Boolean isPreview, @RequestParam final Boolean isCreate, final HttpServletRequest request,
//            HttpServletResponse response) {
//
//        OperateTemplate template = new HttpTemplate(request) {
//            protected void doSomething() throws BusinessException {
//                FileInfo fileInfo = UploadFileUtils.getFileInfo(file, UploadFileFolder.TEMP_UPLOAD_FOLDER);
//
//                File excel = fileInfo.getFile();
//                try {
//                    byte[] bytes = file.getBytes();
//                    FileOutputStream fos = new FileOutputStream(excel);
//                    fos.write(bytes); // 写入文件
//                } catch (IOException e) {
//                    e.printStackTrace();
//                    logger.error(e.getMessage(), e);
//                    throw new BusinessException("文件上传失败");
//                }
//                String fileId = fileInfo.getFileId();
//                this.put("fileId", fileId);
//                logger.debug("fileId: " + fileInfo.getFileId()); // 打印文件大小和文件名称
//                logger.debug("name: " + fileInfo.getFileName()); // 打印文件大小和文件名称
//                logger.debug("size: " + file.getSize()); // 打印文件大小和文件名称
//
//                EntityMetadata entityMetadata = metadataProvider.getEntityMetadataFromDb(code);
//                List<Map<String, Object>> data = TpltUtils.readExcel(excel, 0, entityMetadata, true, null);
//                if (isPreview != null && isPreview) {
//                    this.put(MetadataConst.ITEMS_ROOT, data);
//                }
//
//                if (isCreate) {
//                    data = new ArrayList<Map<String, Object>>();
//                    data = TpltUtils.readExcel(excel, 0, entityMetadata, false, null);
//                    entityService.batchCreate(code, data, this.getUser());
//                }
//            }
//        };
//
//        return template.operate();
//    }

//    @RequestMapping(value = "/batch/{code}/(fileId)", method = RequestMethod.POST)
//    public Map<String, Object> uploadAndPreview(@PathVariable final EntityCode code, @PathVariable final String fileId,
//            final HttpServletRequest request) {
//        OperateTemplate template = new HttpTemplate(request) {
//            protected void doSomething() throws BusinessException {
//                File excel = UploadFileUtils.getFile(fileId, UploadFileFolder.TEMP_UPLOAD_FOLDER);
//                EntityMetadata entityMetadata = metadataProvider.getEntityMetadataFromDb(code);
//                List<Map<String, Object>> data = TpltUtils.readExcel(excel, 0, entityMetadata, true, null);
//                // List<Map<String, Object>> data = TpltUtils.readExcel(excel,
//                // 0, fieldList, true, null);
//                entityService.batchCreate(code, data, this.getUser());
//            }
//        };
//
//        return template.operate();
//    }
}
