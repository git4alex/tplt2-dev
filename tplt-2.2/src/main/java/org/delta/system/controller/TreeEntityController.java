
package org.delta.system.controller;

import org.delta.core.entity.TreeConfig;
import org.delta.core.entity.service.TreeEntityService;
import org.delta.core.metadata.EntityMetadata;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.ValueMap;
import org.delta.system.Result;
import org.delta.utils.TpltUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/entity/tree")
public class TreeEntityController {
    private Logger logger = Logger.getLogger(this.getClass());
    @Resource
    private TreeEntityService treeEntityService;
    @Resource
    private MetadataProvider metadataProvider;

    @RequestMapping(value = "/{entityCode}", method = RequestMethod.GET)
    @ResponseBody
    public Result listAll(@PathVariable String entityCode, @RequestParam Map<String, Object> parameter) {
        TreeConfig treeConfig = TreeConfig.getTreeConfig(parameter);
        List filterMaps = TpltUtils.refactorQueryParams(parameter);
        return Result.list(treeEntityService.getTree(entityCode, treeConfig,filterMaps));
    }

    @RequestMapping(value = "/{entityCode}/{nodeId}", method = RequestMethod.GET)
    @ResponseBody
    public Result listChildren(@PathVariable String entityCode, @PathVariable String nodeId, @RequestParam Map<String, Object> parameter, HttpServletRequest request) {
        TreeConfig treeConfig = TreeConfig.getTreeConfig(parameter);
        return Result.list(treeEntityService.getChildren(entityCode, treeConfig, nodeId));
    }

    @RequestMapping(value = "/{entityCode}", method = RequestMethod.POST)
    @ResponseBody
    public Result createNode(@PathVariable String entityCode, @RequestParam Map<String, String> parameter, @RequestBody ValueMap data) {
        EntityMetadata entiyMetadata = metadataProvider.getEntityMetadata(entityCode);
        ValueMap node = treeEntityService.createNode(entityCode, TreeConfig.getTreeConfig(parameter), data);
        return Result.data(node);
    }

    @RequestMapping(value = "/{entityCode}/{id}", method = RequestMethod.DELETE)
    @ResponseBody
    public Result deleteNode(@PathVariable String entityCode, @PathVariable String id, @RequestBody Map<String, String> parameter) {
        treeEntityService.deleteNode(entityCode, TreeConfig.getTreeConfig(parameter), id);
        return Result.success();
    }

    @RequestMapping(value = "/{entityCode}/{id}/{pid}/{index}", method = RequestMethod.POST)
    @ResponseBody
    public Result moveNode(@PathVariable String entityCode,
                           @PathVariable String id,
                           @PathVariable String pid,
                           @PathVariable int index,
                           @RequestParam Map<String, String> parameter) {
        treeEntityService.updateNodePosition(entityCode, TreeConfig.getTreeConfig(parameter), id, pid, index);
        return Result.success();
    }
}


