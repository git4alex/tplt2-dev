package org.delta.system.controller;

import org.activiti.engine.RepositoryService;
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

    @RequestMapping(value = "/defination", method = RequestMethod.POST)
    @ResponseBody
    public Result deploy(@RequestBody Map<String, Object> flowDefination) {
        String processId = MapUtils.getString(flowDefination, "id");

        String src = MapUtils.getString(flowDefination, "src");
        String def = MapUtils.getString(flowDefination, "def");

        DeploymentBuilder builder = repositoryService.createDeployment();
        builder.name(processId);
        builder.addString(TpltDeployer.TPLT_PROCESS_SRC, src);
        builder.addString(TpltDeployer.TPLT_PROCESS_DEF, def);
        builder.deploy();

        return Result.success();
    }

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

    @RequestMapping(value = "/model/{id}/deploy", method = RequestMethod.POST)
    @ResponseBody
    public Result deployModel(@PathVariable String id) {
        Model model = repositoryService.getModel(id);
        String src = new String(repositoryService.getModelEditorSource(id));
        String json = wfService.getModelJson(id);

        DeploymentBuilder builder = repositoryService.createDeployment();
        builder.name(model.getName());
        builder.addString(TpltDeployer.TPLT_PROCESS_SRC, src);
        builder.addString(TpltDeployer.TPLT_PROCESS_DEF, json);
        builder.deploy();

        return Result.success();
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
}
