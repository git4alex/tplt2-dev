package org.delta.core.entity;

import org.delta.core.exception.BusinessException;

public abstract class EntityEventListener {
	public abstract boolean accept(String entityCode);

	public void on(EntityEventManager.EntityEvent evt, Object data) throws BusinessException {
		switch (evt) {
		case PRE_CREATE:
			beforeCreate(data);
            break;
		case POST_CREATE:
			afterCreate(data);
            break;
		case PRE_UPDATE:
			beforeUpdate(data);
            break;
		case POST_UPDATE:
			afterUpdate(data);
            break;
		case PRE_DELETE:
			beforeDelete(data);
            break;
		case POST_DELETE:
			afterDelete(data);
		}
	}

	public void beforeCreate(Object data) throws BusinessException {
	}

	public void afterCreate(Object data) throws BusinessException {
	}

	public void beforeUpdate(Object data) throws BusinessException {
	}

	public void afterUpdate(Object data) throws BusinessException {
	}

	public void beforeDelete(Object data) throws BusinessException {
	}

	public void afterDelete(Object data) throws BusinessException {
	}
}
