package org.delta.spring;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.beans.factory.config.PropertyPlaceholderConfigurer;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;

public class AnnotationBeanPostProcessor extends PropertyPlaceholderConfigurer implements BeanPostProcessor, InitializingBean {

	private static transient Log logger = LogFactory.getLog(AnnotationBeanPostProcessor.class);

	private java.util.Properties pros;
	private Class[] enableClassList = { String.class };

	public void setEnableClassList(Class[] enableClassList) {
		this.enableClassList = enableClassList;
	}

	public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {

		Field[] fields = bean.getClass().getDeclaredFields();

		for (Field field : fields) {
			if (logger.isDebugEnabled()) {

			}

			if (field.isAnnotationPresent(Properties.class)) {
				if (filterType(field.getType().toString())) {
					Properties p = field.getAnnotation(Properties.class);
					try {
						ReflectionUtils.makeAccessible(field);
						field.set(bean, pros.getProperty(p.name()));
					} catch (Exception e) {
						logger.error(e);
					}
				}
			}
		}

		return bean;
	}

	private boolean filterType(String type) {
		if (type != null) {
			for (Class c : enableClassList) {
				if (c.toString().equals(type)) {
					return true;
				}
			}

			return false;
		} else {
			return true;
		}
	}

	public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
		return bean;
	}

	public void afterPropertiesSet() throws Exception {
		pros = mergeProperties();
	}
}
