package org.delta.core.entity;

import org.delta.core.exception.BusinessException;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

@Service
public class EntityEventManager {
	public enum EntityEvent {
		PRE_CREATE, POST_CREATE, PRE_UPDATE, POST_UPDATE, PRE_DELETE, POST_DELETE
	}

	@Resource
	private List<EntityEventListener> listeners = new ArrayList<EntityEventListener>();

	public void fire(String entityCode, EntityEvent evt, Object data) throws BusinessException {
		for (EntityEventListener listener : listeners) {
			if (listener.accept(entityCode)) {
				listener.on(evt, data);
			}
		}
	}
}
