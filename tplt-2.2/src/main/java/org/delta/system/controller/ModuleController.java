package org.delta.system.controller;

import org.delta.core.utils.ValueMap;
import org.delta.system.Result;
import org.delta.system.service.ModuleService;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.List;

@Controller
public class ModuleController {
    private Logger logger = Logger.getLogger(ModuleController.class);

    @Resource
    private ModuleService moduleService;

    @RequestMapping(value = "/module/{mid}", method = RequestMethod.GET)
    @ResponseBody
    public Result get(@PathVariable final String mid, HttpServletRequest request) throws Exception {
        return Result.data(moduleService.getModuleConfig(mid));
    }

    @RequestMapping(value = "/comtree", method = RequestMethod.GET)
    @ResponseBody
    public List<ValueMap> getComNodes(@RequestParam final String moduleId, HttpServletRequest request) {
        if (StringUtils.equalsIgnoreCase(moduleId, "-1")) {
            return moduleService.getModuleNodes();
        } else {
            return moduleService.getComNodes(moduleId);
        }
    }

    @RequestMapping(value = "/xdscfg/{mid}/{comId}", method = RequestMethod.GET)
    @ResponseBody
    public ValueMap getComConfig(@PathVariable final String mid, @PathVariable final String comId, HttpServletRequest request) {
        return moduleService.getComponentXdsConfig(mid, comId);
    }

    @RequestMapping(value = "/xdscfg/{mid}", method = RequestMethod.GET)
    @ResponseBody
    public ValueMap getModuleConfig(@PathVariable final String mid, HttpServletRequest request) {
        return moduleService.getModuleXdsConfig(mid);
    }

    @RequestMapping(value = "/rtcfg", method = RequestMethod.POST)
    @ResponseBody
    public ValueMap getRtConfig(@RequestBody final ValueMap jsonCfg, HttpServletRequest request) throws IOException {
        String cfg = MapUtils.getString(jsonCfg, "jsonCfg");
        return moduleService.getRtConfig(cfg);
    }

    @RequestMapping(value = "/module/{mid}", method = RequestMethod.PUT)
    @ResponseBody
    public Result updateModule(@PathVariable String mid, @RequestBody ValueMap module) {
        moduleService.saveModule(mid, module);
        return Result.success();
    }

    @RequestMapping(value = "/module/{mid}", method = RequestMethod.DELETE)
    @ResponseBody
    public Result deleteModule(final @PathVariable String mid, HttpServletRequest request) {
        moduleService.deleteModule(mid);
        return Result.success();
    }
}
