package org.delta.system.service;

import org.activiti.engine.RepositoryService;
import org.activiti.engine.repository.Model;
import org.apache.commons.collections.MapUtils;
import org.delta.core.exception.BusinessException;
import org.delta.core.utils.ValueMap;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.*;
import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-21
 * Time: 上午10:52
 */
@Service
public class WorkflowService {
    @Resource
    private RepositoryService repositoryService;

    public ValueMap createModel(Map<String, Object> data) {
        Model model = repositoryService.newModel();
        saveDataInModel(model, data);
        ValueMap ret = new ValueMap();
        ret.put("model", model);
        return ret;
    }

    public ValueMap updateModel(String id, Map<String, Object> data) {
        Model model = repositoryService.getModel(id);
        saveDataInModel(model, data);
        ValueMap ret = new ValueMap();
        ret.put("model", model);
        return ret;
    }

    private void saveDataInModel(Model model, Map<String, Object> data) {
        String key = MapUtils.getString(data, "key");
        String name = MapUtils.getString(data, "name");
        String category = MapUtils.getString(data, "category");
        model.setName(name);
        model.setKey(key);
        model.setCategory(category);
        repositoryService.saveModel(model);

        String src = MapUtils.getString(data, "src");
        repositoryService.addModelEditorSource(model.getId(), src.getBytes());
        String json = MapUtils.getString(data, "json");
        String svg = MapUtils.getString(data, "svg");

        ValueMap srcExt = new ValueMap();
        srcExt.put("json", json);
        srcExt.put("svg", svg);
        try {
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            ObjectOutput out = new ObjectOutputStream(bos);
            out.writeObject(srcExt);
            repositoryService.addModelEditorSourceExtra(model.getId(), bos.toByteArray());
            out.close();
            bos.close();
        } catch (IOException ex) {
            throw new BusinessException(ex.getMessage(), ex);
        }
    }

    public String getModelJson(String id){
        return getModelSrcExt(id,"json");
    }

    private String getModelSrcExt(String id,String key){
        byte[] ba = repositoryService.getModelEditorSourceExtra(id);

        try {
            ByteArrayInputStream bis = new ByteArrayInputStream(ba);
            ObjectInput in = new ObjectInputStream(bis);
            ValueMap o = (ValueMap) in.readObject();
            return MapUtils.getString(o,key);
        } catch (Exception e) {
            throw new BusinessException(e.getMessage(),e);
        }
    }
}
