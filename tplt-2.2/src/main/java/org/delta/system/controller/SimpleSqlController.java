package org.delta.system.controller;

import org.delta.core.dao.OrderBy;
import org.delta.core.dao.Page;
import org.delta.core.sql.provider.XmlSqlProvider;
import org.delta.core.sql.service.SimpleSqlService;
import org.delta.core.utils.ValueMap;
import org.delta.system.Result;
import org.delta.utils.TpltUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.ModelAndView;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * date: 2011-7-27
 * <p/>
 * version: 1.0
 * commonts: ......
 */
@Controller
@RequestMapping("/sql")
public class SimpleSqlController {
    private Logger logger = Logger.getLogger(this.getClass());

    @Resource
    private SimpleSqlService simpleSqlService;

    @RequestMapping(value = "/{namespace}/{sqlName}", method = RequestMethod.GET)
    @ResponseBody
    public ValueMap list(@PathVariable String namespace, @PathVariable String sqlName, @RequestParam ValueMap requestParam, HttpServletRequest request) {
        OrderBy orderBy = TpltUtils.refactorOrderByParams(requestParam);
        List<ValueMap> queryParams = TpltUtils.refactorQueryParams(requestParam);
        int start = MapUtils.getInteger(requestParam, "start", -1);
        int limit = MapUtils.getInteger(requestParam, "limit", -1);

        if (start > 0 && limit > 0) {
            Page page = simpleSqlService.page(namespace, sqlName, requestParam, start, limit);
            return Result.list(page);
        } else {
            return Result.list(simpleSqlService.list(namespace, sqlName, requestParam));
        }
    }

    @RequestMapping(value = "/listSqlTitle", method = RequestMethod.GET)
    @ResponseBody
    public Result listSqlTitle(@RequestParam Map data, HttpServletRequest request) {
        List<ValueMap> list = XmlSqlProvider.listSqlTitle();
        return Result.list(list);
    }

    @RequestMapping(value = "/page/{pageName}", method = RequestMethod.GET)
    public ModelAndView list(@PathVariable String pageName, HttpServletRequest request) {
        Map map = new HashMap();

        List wordList = new ArrayList();
        wordList.add("hello");
        wordList.add("world");
        map.put("wordList", wordList);
        return new ModelAndView("xl", map);
    }
}


