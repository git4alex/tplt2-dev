package org.delta.core.entity;

import org.aopalliance.intercept.MethodInterceptor;
import org.aopalliance.intercept.MethodInvocation;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Component
public class EntityServiceInterceptor implements MethodInterceptor {

	@Resource
	private List<EntityEventListener> handlers = new ArrayList<EntityEventListener>();

	@Override
	public Object invoke(MethodInvocation invocation) throws Throwable {

		return invocation.proceed();
	}
}
