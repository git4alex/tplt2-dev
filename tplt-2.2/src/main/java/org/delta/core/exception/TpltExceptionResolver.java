package org.delta.core.exception;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.handler.AbstractHandlerExceptionResolver;
import org.springframework.web.servlet.view.json.MappingJacksonJsonView;
import org.springframework.web.util.WebUtils;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * User: Alex
 * Date: 12-12-19
 * Time: 下午2:54
 */

@Component
public class TpltExceptionResolver extends AbstractHandlerExceptionResolver{
    private Logger logger = Logger.getLogger(TpltExceptionResolver.class);

    public static int DEFAULT_STATUS_CODE = 5001;
    @Override
    protected ModelAndView doResolveException(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) {

        if(logger.isDebugEnabled()){
            logger.debug("exception: " ,ex);
        }

        response.setStatus(DEFAULT_STATUS_CODE);
        request.setAttribute(WebUtils.ERROR_STATUS_CODE_ATTRIBUTE, DEFAULT_STATUS_CODE);
        return new ModelAndView(new MappingJacksonJsonView(),"exception",ex); }
}
