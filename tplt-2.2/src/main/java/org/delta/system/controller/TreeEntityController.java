
package org.delta.system.controller;

import org.apache.log4j.Logger;
import org.delta.core.entity.TreeConfig;
import org.delta.core.entity.service.TreeEntityService;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.ValueMap;
import org.delta.system.Result;
import org.delta.utils.TpltUtils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
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

    /**
     * 将指定的实体组装为树型结构。
     * 默认跟节点id为-1
     *
     * @param entityCode 实体编码
     * @param treeConfig  树结构定义{pidCode,indexCode,pathCode}
     *
     * @return 树型结构 {id,text,children[{id，text},...]}
     */
    @RequestMapping(value = "/{entityCode}", method = RequestMethod.GET)
    @ResponseBody
    public Result listAll(@PathVariable String entityCode, @RequestParam Map<String, Object> treeConfig) {
        TreeConfig config = TreeConfig.getTreeConfig(treeConfig);
        List filterMaps = TpltUtils.refactorQueryParams(treeConfig);
        return Result.list(treeEntityService.getTree(entityCode, config,filterMaps));
    }

    /**
     * 取指定节点的子节点列表，不包含孙子节点。用于树的异步加载
     *
     * @param entityCode 实体编码
     * @param nodeId    指定的节点ID
     * @param parameter 树结构定义{pidCode,indexCode,pathCode}
     *
     * @return 子节点列表
     */
    @RequestMapping(value = "/{entityCode}/{nodeId}", method = RequestMethod.GET)
    @ResponseBody
    public Result listChildren(@PathVariable String entityCode, @PathVariable String nodeId, @RequestParam Map<String, Object> parameter) {
        TreeConfig treeConfig = TreeConfig.getTreeConfig(parameter);
        return Result.list(treeEntityService.getChildren(entityCode, treeConfig, nodeId));
    }

    /**
     * 创建节点。父节点的id在data中指定，未指定时，在根节点下创建
     *
     * @param entityCode 实体编码
     * @param treeConfig 树结构定义{pidCode,indexCode,pathCode}
     * @param data 节点参数
     *
     * @return 新创建的子节点
     */
    @RequestMapping(value = "/{entityCode}", method = RequestMethod.POST)
    @ResponseBody
    public Result createNode(@PathVariable String entityCode, @RequestParam Map<String, String> treeConfig, @RequestBody ValueMap data) {
        ValueMap node = treeEntityService.createNode(entityCode, TreeConfig.getTreeConfig(treeConfig), data);
        return Result.data(node);
    }

    /**
     * 删除指定节点。同时删除节点的子孙节点
     *
     * @param entityCode    实体编码
     * @param id            实体ID
     * @param treeConfig    树结构定义{pidCode,indexCode,pathCode}
     *
     * @return 操作结果
     */
    @RequestMapping(value = "/{entityCode}/{id}", method = RequestMethod.DELETE)
    @ResponseBody
    public Result deleteNode(@PathVariable String entityCode, @PathVariable String id, @RequestBody Map<String, String> treeConfig) {
        treeEntityService.deleteNode(entityCode, TreeConfig.getTreeConfig(treeConfig), id);
        return Result.success();
    }

    /**
     * 移动节点。包含节点的子孙节点
     *
     * @param entityCode 实体编码
     * @param id         节点ID
     * @param pid        新的父节点ID
     * @param index      新的节点位置
     * @param treeConfig 树结构定义{pidCode,indexCode,pathCode}
     *
     * @return 操作结果
     */
    @RequestMapping(value = "/{entityCode}/{id}/{pid}/{index}", method = RequestMethod.POST)
    @ResponseBody
    public Result moveNode(@PathVariable String entityCode,
                           @PathVariable String id,
                           @PathVariable String pid,
                           @PathVariable int index,
                           @RequestParam Map<String, String> treeConfig) {
        treeEntityService.updateNodePosition(entityCode, TreeConfig.getTreeConfig(treeConfig), id, pid, index);
        return Result.success();
    }

    //TODO:节点过滤
}


