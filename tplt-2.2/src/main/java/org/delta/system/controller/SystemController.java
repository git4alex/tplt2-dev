package org.delta.system.controller;

import org.delta.core.entity.service.AclService;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.ValueMap;
import org.delta.system.Result;
import org.delta.system.service.AppConfigService;
import org.delta.system.service.BizCodeService;
import org.delta.system.service.PwdService;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.ObjectUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.map.ObjectMapper;
import org.codehaus.jackson.type.TypeReference;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import java.io.IOException;
import java.io.OutputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * date: 2010-7-27
 * <p/>
 * version: 1.0 commonts: ......
 */
@Controller
public class SystemController {
    private Logger logger = Logger.getLogger(SystemController.class);

    @Resource
    private MetadataProvider metadataProvider;
    @Resource
    private BizCodeService bizCodeService;
    @Resource
    private AclService aclService;
    @Resource
    private AppConfigService appConfigService;
    @Resource
    private PwdService pwdService;

    @RequestMapping(value = "/getAppConfig")
    @ResponseBody
    public Result getAppConfig(HttpServletRequest request) throws Exception {
        return Result.data(appConfigService.getAppConfig());
    }

    @RequestMapping(value = "/clearMetadataCache")
    @ResponseBody
    public Result clearMetadataCache() {
        metadataProvider.clearMetadataCache();
        return Result.message("元数据缓存已清除");
    }

    @RequestMapping(value = "/pwd/{userId}", method = RequestMethod.POST)
    @ResponseBody
    public Result setPwd(@PathVariable final String userId,@RequestBody ValueMap data){
        String newPwd = MapUtils.getString(data,"newPassword");
        pwdService.setPwd(userId,newPwd);
        return Result.success();
    }

    @RequestMapping(value = "/pwd/{userId}", method = RequestMethod.PUT)
    @ResponseBody
    public Result updatePwd(@PathVariable final String userId,@RequestBody ValueMap data){
        String oldPwd = MapUtils.getString(data, "oldPassword");
        String newPwd = MapUtils.getString(data,"newPassword");
        pwdService.upatePwd(userId,oldPwd,newPwd);
        return Result.success();
    }

    @RequestMapping(value = "/reloadBiz")
    @ResponseBody
    public Result reloadBiz() {
        bizCodeService.load();
        return Result.success();
    }

    @RequestMapping(value = "/reloadAcl")
    @ResponseBody
    public Result reloadAcl() {
        aclService.reload();
        return Result.success();
    }

    @RequestMapping(value = "/clipboard", method = RequestMethod.GET)
    @ResponseBody
    public Map getClipboard(final HttpServletRequest request) {
        Map<String, String> ret = new HashMap<String, String>();
        HttpSession session = request.getSession(true);
        ret.put("data", ObjectUtils.toString(session.getAttribute("tplt_clipboard")));

        return ret;
    }

    @RequestMapping(value = "/clipboard", method = RequestMethod.PUT)
    @ResponseBody
    public Result setClipboard(final @RequestBody ValueMap data, final HttpServletRequest request) {
        HttpSession session = request.getSession(true);
        session.setAttribute("tplt_clipboard", data.get("data"));
        return Result.success();
    }

    @RequestMapping(value = "/sysConfig", method = RequestMethod.GET)
    public void expConfig(@RequestParam(required = false) String params, HttpServletResponse response) {
        try {
            response.reset();
            response.setCharacterEncoding("UTF-8");
            response.setHeader("Content-Disposition", "attachment; filename=config.cfg");
            OutputStream os = response.getOutputStream();

            Map<String, List<String>> requestParam = new ObjectMapper().readValue(params, new TypeReference<Map<String, List<String>>>() {
            });
            String jsonConfig = appConfigService.getJsonConfig(requestParam);

            os.write(jsonConfig.getBytes("UTF-8"));
            os.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * import system config
     *
     * @param configFile format:{type:[{config1},{config2}],type2:[{config1},{config2}]}
     */
    @RequestMapping(value = "/sysConfig", method = RequestMethod.POST)
    @ResponseBody
    public Result impConfig(@RequestParam(required = false) MultipartFile configFile, HttpServletResponse response) {
        ValueMap configMap = null;
        try {
            configMap = new ObjectMapper().readValue(configFile.getInputStream(), new TypeReference<ValueMap>() {
            });
        } catch (IOException e) {
            e.printStackTrace();
            throw new BusinessException("读取上传文件失败");
        }

        appConfigService.updateJsonConfig(configMap);

        return Result.success();
    }

}
