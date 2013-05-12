package org.delta.system.controller;

import org.delta.system.Result;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * date: 2010-7-26
 * <p/>
 * version: 1.0
 * commonts: ......
 */
@Controller
public class LoginController {
    private Logger logger = Logger.getLogger(LoginController.class);

    @RequestMapping(value = "index", method = RequestMethod.GET)
    public ModelAndView showDesktop(HttpServletRequest request, HttpServletResponse response) {
        return new ModelAndView("index");
    }

    @RequestMapping(value = "loginSuccess")
    @ResponseBody
    public Result loginSuccess() {
        return Result.success();
    }

    @RequestMapping(value = "loginFailure", method = RequestMethod.GET)
    @ResponseBody
    public Result loginFailure() {
        return Result.error("login failure");
    }
}


