package org.delta.activiti.identity;

import org.activiti.engine.impl.interceptor.Session;
import org.activiti.engine.impl.interceptor.SessionFactory;
import org.activiti.engine.impl.persistence.entity.UserEntityManager;

/**
 * User: Alex
 * Date: 13-5-26
 * Time: 下午11:22
 */
public class UserManagerFactory implements SessionFactory {
    UserManager userManager = new UserManager();
    @Override
    public Class<?> getSessionType() {
        return UserEntityManager.class;
    }

    @Override
    public Session openSession() {
        return userManager;
    }
}
