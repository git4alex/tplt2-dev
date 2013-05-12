package org.delta.system.controller;

import org.delta.core.dao.Filter;
import org.delta.core.entity.service.EntityService;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.MetadataConst;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.ValueMap;
import org.delta.system.Result;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import java.util.List;

@Controller
@RequestMapping("/metadata")
public class MetadataController {
    private Logger logger = Logger.getLogger(MetadataController.class);

    @Resource
    private EntityService entityService;
    @Resource
    private MetadataProvider metadataProvider;

    @RequestMapping(value = "/load/{entityCode}", method = RequestMethod.GET)
    @ResponseBody
    public Result loadFromDb(@PathVariable final String entityCode) {
        ValueMap entityMetadata = entityService.get(MetadataConst.CODE_ENTITY_METADATA, Filter.field(MetadataConst.EntityMetadataField.code.toString()).eq(entityCode));
        String tableName = MapUtils.getString(entityMetadata, MetadataConst.EntityMetadataField.tableName.toString());
        if (StringUtils.isBlank(tableName)) {
            throw new BusinessException("table name is blank");
        }

        List<ValueMap> columnList = metadataProvider.loadColumsFromDbMetadata(tableName);
        List<ValueMap> fieldList = entityService.list(MetadataConst.CODE_FIELD_METADATA, Filter.field(MetadataConst.FieldMetadataField.entityCode.toString()).eq(entityCode));
        for (ValueMap col : columnList) {
            String colName = MapUtils.getString(col, MetadataConst.FieldMetadataField.columnName.toString());
            boolean fieldExists = false;
            for (ValueMap field : fieldList) {
                String propColName = MapUtils.getString(field,MetadataConst.FieldMetadataField.columnName.toString());
                if (StringUtils.equalsIgnoreCase(colName, propColName)) {
                    fieldExists = true;
                    break;
                }
            }

            if (!fieldExists) {
                createField(entityCode, col);
            }
        }
        return Result.success();
    }

    private void createField(String entityCode, ValueMap col) {
        ValueMap prop = new ValueMap();
        prop.put("entityCode", entityCode);
        prop.put("code", MapUtils.getString(col, MetadataConst.FieldMetadataField.code.toString()));
        prop.put("name", MapUtils.getString(col, MetadataConst.FieldMetadataField.code.toString()));
        prop.put("columnName", MapUtils.getString(col, MetadataConst.FieldMetadataField.columnName.toString()));
        prop.put("dataType", MapUtils.getString(col, MetadataConst.FieldMetadataField.dataType.toString()));
        prop.put("primaryKey", false);
        prop.put("mandatory", MapUtils.getBoolean(col, MetadataConst.FieldMetadataField.mandatory.toString()));
        entityService.create(MetadataConst.CODE_FIELD_METADATA, prop);
    }
}
