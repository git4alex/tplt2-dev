package org.delta.system.controller;

import org.activiti.engine.RepositoryService;
import org.activiti.engine.repository.Deployment;
import org.activiti.engine.repository.DeploymentBuilder;
import org.activiti.engine.repository.Model;
import org.activiti.engine.repository.ModelQuery;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.delta.activiti.TpltDeployer;
import org.delta.activiti.TpltRepositoryServiceImpl;
import org.delta.core.utils.ValueMap;
import org.delta.system.Result;
import org.delta.system.service.WorkflowService;
import org.springframework.stereotype.Controller;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-11
 * Time: 下午9:06
 */
@Controller
@RequestMapping(value = "/workflow")
public class WorkflowController {
    private static final Logger logger = Logger.getLogger(WorkflowController.class);

    @Resource
    private RepositoryService repositoryService;
    @Resource
    private WorkflowService wfService;

    @RequestMapping(value = "/bpmn20", method = RequestMethod.POST)
    @ResponseBody
    public Result bpmn20(@RequestBody Map jsonDef) {
        String def = MapUtils.getString(jsonDef, "def");
        Assert.isTrue(StringUtils.isNotBlank(def), "read json defination got blank");
        TpltRepositoryServiceImpl tpltRepositoryService = (TpltRepositoryServiceImpl) repositoryService;
        return Result.message(tpltRepositoryService.convertJsonProcess2bpmn20(def));
    }

    @RequestMapping(value = "/model", method = RequestMethod.GET)
    @ResponseBody
    public Result listModel() {
        ModelQuery mq = repositoryService
                .createModelQuery()
                .orderByModelCategory()
                .orderByLastUpdateTime().desc();
        return Result.list(mq.list());
    }

    @RequestMapping(value = "/model/{id}", method = RequestMethod.GET)
    @ResponseBody
    public Result getModel(@PathVariable String id) {
        Model model = repositoryService.getModel(id);
        String src = new String(repositoryService.getModelEditorSource(id));

        ValueMap ret = new ValueMap();
        ret.put("model", model);
        ret.put("src", src);
        return Result.data(ret);
    }

    @RequestMapping(value = "/model/{id}/json", method = RequestMethod.GET)
    @ResponseBody
    public Result getModelSvg(@PathVariable String id) {
        String json = wfService.getModelJson(id);
        return Result.message(json);
    }

    @RequestMapping(value = "/model", method = RequestMethod.POST)
    @ResponseBody
    public Result createModel(@RequestBody Map<String, Object> data) {
        ValueMap ret = wfService.createModel(data);
        return Result.data(ret);
    }

    @RequestMapping(value = "/model/{id}", method = RequestMethod.PUT)
    @ResponseBody
    public Result updateModel(@PathVariable String id, @RequestBody Map<String, Object> data) {
        ValueMap ret = wfService.updateModel(id, data);
        return Result.data(ret);
    }

    @RequestMapping(value = "/model/{id}", method = RequestMethod.DELETE)
    @ResponseBody
    public Result deleteModel(@PathVariable String id) {
        repositoryService.deleteModel(id);
        return Result.success();
    }

    @RequestMapping(value = "/deployment/{modelId}", method = RequestMethod.POST)
    @ResponseBody
    public Result deployModel(@PathVariable String modelId) throws UnsupportedEncodingException {
        Model model = repositoryService.getModel(modelId);
        String json = wfService.getModelJson(modelId);

        DeploymentBuilder builder = repositoryService.createDeployment();
        builder.name(model.getName());
        builder.addInputStream(TpltDeployer.TPLT_PROCESS_SRC, new ByteArrayInputStream(repositoryService.getModelEditorSource(modelId)));
        builder.addInputStream(TpltDeployer.TPLT_PROCESS_DEF, new ByteArrayInputStream(json.getBytes("utf-8")));
        Deployment deployment = builder.deploy();
        model.setDeploymentId(deployment.getId());
        repositoryService.saveModel(model);

        return Result.success();
    }

    @RequestMapping(value = "/deployment/{id}/resource/{resourceType}", method = RequestMethod.GET)
    @ResponseBody
    public Result getDeploymentResource(@PathVariable String id, @PathVariable String resourceType) throws IOException {
        Deployment dep = repositoryService.createDeploymentQuery().deploymentId(id).singleResult();
        InputStream is = null;
        if ("json".equalsIgnoreCase(resourceType)) {
            is = repositoryService.getResourceAsStream(dep.getId(), TpltDeployer.TPLT_PROCESS_DEF);
        } else if ("tplt".equalsIgnoreCase(resourceType)) {
            is = repositoryService.getResourceAsStream(dep.getId(), TpltDeployer.TPLT_PROCESS_SRC);
        } else if ("bpmn".equalsIgnoreCase(resourceType)) {
            is = repositoryService.getResourceAsStream(dep.getId(), TpltDeployer.TPLT_PROCESS_BPMN);
        }

        int i = -1;
        byte[] b = new byte[1024];
        StringBuilder sb = new StringBuilder();
        while ((i = is.read(b)) != -1) {
            sb.append(new String(b, 0, i));
        }
        String content = sb.toString();
        if(is != null){
            is.close();
        }
        return Result.message(content);
    }

    @RequestMapping(value = "/deployment/{id}", method = RequestMethod.DELETE)
    @ResponseBody
    public Result deleteDeployment(@PathVariable String id,@RequestBody Map params) {
        boolean cascade = MapUtils.getBoolean(params,"cascade",true);
        repositoryService.deleteDeployment(id,cascade);
        return Result.success();
    }

    @RequestMapping(value = "/processDefination/{id}", method = RequestMethod.PUT)
    @ResponseBody
    public Result updateProcessDefination(@PathVariable String id,@RequestBody Map params) {
        boolean suspend = MapUtils.getBoolean(params,"suspend");
        boolean includeProcessInstances = MapUtils.getBoolean(params,"includeProcessInstances");

        if(suspend){
            repositoryService.suspendProcessDefinitionById(id,includeProcessInstances,null);
        }else{
            repositoryService.activateProcessDefinitionById(id,includeProcessInstances,null);
        }
        return Result.success();
    }


}
