package org.delta.security;

import org.delta.core.utils.ValueMap;

import javax.servlet.http.HttpServletRequest;

/**
 * User: Alex
 * Date: 13-1-17
 * Time: 上午11:00
 */
public class SessionUtil {
    public static final String USER_KEY = "CURRENT_LOGIN_USER";
    public static final String APP_CONTEXT_CONFIG_KEY = "APP_CONTEXT_CONFIG_KEY";

    public final static IUser getUser(HttpServletRequest request) {
        Object user = request.getSession().getAttribute(USER_KEY);
        if (user != null) {
            return (IUser) user;
        } else {
            return null;
        }
    }

    public static void setUser(HttpServletRequest request, IUser user) {
        request.getSession().setAttribute(USER_KEY, user);
    }

    public static ValueMap getAppContextConfig(HttpServletRequest request) {
        Object config = request.getSession().getAttribute(APP_CONTEXT_CONFIG_KEY);
        if (config != null) {
            return (ValueMap) config;
        } else {
            return null;
        }
    }

    public static void setAppContextConfig(HttpServletRequest request, ValueMap config) {
        request.getSession().setAttribute(APP_CONTEXT_CONFIG_KEY, config);
    }
}
