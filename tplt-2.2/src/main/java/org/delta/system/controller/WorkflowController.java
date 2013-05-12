package org.delta.system.controller;

import org.activiti.engine.ProcessEngine;
import org.activiti.engine.repository.DeploymentBuilder;
import org.apache.commons.collections.MapUtils;
import org.apache.log4j.Logger;
import org.delta.activiti.TpltDeployer;
import org.delta.system.Result;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

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
    private ProcessEngine engine;

    @RequestMapping(value = "/defination", method = RequestMethod.POST)
    @ResponseBody
    public Result deploy(@RequestBody Map<String,Object> flowDefination) {
        String processId = MapUtils.getString(flowDefination,"id");
        //String processName = MapUtils.getString(flowDefination,"name");
        String src = MapUtils.getString(flowDefination,"src");
        String def = MapUtils.getString(flowDefination,"def");

        DeploymentBuilder builder = engine.getRepositoryService().createDeployment();
        builder.name(processId);
        builder.addString(TpltDeployer.TPLT_PROCESS_SRC, src);
        builder.addString(TpltDeployer.TPLT_PROCESS_DEF, def);
        builder.deploy();

        return Result.success();
    }
}
