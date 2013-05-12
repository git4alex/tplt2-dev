package org.delta.spring.holder;

import org.delta.security.IUser;
import org.delta.security.SessionUtil;
import org.apache.log4j.Logger;
import org.springframework.context.ApplicationContext;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.context.support.WebApplicationContextUtils;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

/**
 * Servlet 上下文数据获取
 * <p/>
 * User: Jeff
 * <p/>
 * Date: 12-11-16 上午9:23
 */
public class AppContextHolder {
    private Logger log = Logger.getLogger(AppContextHolder.class);

    public static ApplicationContext getApplicationContext() {
        ServletContext context = getServletContext();
        if (context == null) {

        }
        return WebApplicationContextUtils.getRequiredWebApplicationContext(context);
    }

    public static ServletContext getServletContext() {
        //TODO 通过 seesion 获取 ServletContext 不合理，很有可能 seesion 是空的
        HttpSession session = getSession();
        if (session != null) {
            return session.getServletContext();
        }
        return null;
    }

    public static HttpSession getSession() {
        HttpServletRequest request = getServletRequest();
        if (request != null) {
            return request.getSession();
        }
        return null;
    }

    public static HttpServletRequest getServletRequest() {
        RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();

        if (requestAttributes instanceof ServletRequestAttributes) {
            return ((ServletRequestAttributes) requestAttributes).getRequest();
        }

        //throw new RuntimeException(" 通过 requestAttributes 无法获取 HttpServletRequest , 必须设置  ");
        return null;
    }

    public static IUser getLoginUser() {
        HttpSession session = AppContextHolder.getSession();
        if (session != null) {
            Object user = session.getAttribute(SessionUtil.USER_KEY);
            if (user != null && user instanceof IUser) {
                return (IUser) user;
            }
        }
        return null;
    }
}

