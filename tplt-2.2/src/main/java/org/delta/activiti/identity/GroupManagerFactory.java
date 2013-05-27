package org.delta.activiti.identity;

import org.activiti.engine.impl.interceptor.Session;
import org.activiti.engine.impl.interceptor.SessionFactory;
import org.activiti.engine.impl.persistence.entity.GroupEntityManager;

/**
 * User: Alex
 * Date: 13-5-26
 * Time: 下午11:28
 */
public class GroupManagerFactory implements SessionFactory {
    private GroupManager groupManager= new GroupManager();
    @Override
    public Class<?> getSessionType() {
        return GroupEntityManager.class;
    }

    @Override
    public Session openSession() {
        return groupManager;
    }
}
