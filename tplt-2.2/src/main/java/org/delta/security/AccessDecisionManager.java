package org.delta.security;

import org.apache.log4j.Logger;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.ConfigAttribute;
import org.springframework.security.authentication.InsufficientAuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.util.Assert;

import java.util.Collection;

public class AccessDecisionManager implements org.springframework.security.access.AccessDecisionManager {

	private static final Logger logger = Logger.getLogger(AccessDecisionManager.class);

	/**
	 * In this method, need to compare authentication with configAttributes.
	 * 1, A object is a URL, a filter was get permission configuration by this URL, and pass to here.
	 * 2, Check authentication has attribute in permission configuration (configAttributes)
	 * 3, If not match corresponding authentication, throw a AccessDeniedException.
	 */
	public void decide(Authentication authentication, Object object,Collection<ConfigAttribute> configAttributes)
			throws AccessDeniedException, InsufficientAuthenticationException {

		Assert.notNull(object, " object is must not null !");

		if (configAttributes == null) {
			return;
		}

        for (ConfigAttribute ca : configAttributes) {
            String needAuthority = ca.getAttribute();
            for (GrantedAuthority ga : authentication.getAuthorities()) {
                if (needAuthority.equals(ga.getAuthority())) {
                    return;
                }
            }
        }

        throw new AccessDeniedException("Access is denied on:[" + object.toString() + "]\n"
                + "This Object need authority is：" + configAttributes + "\n"
                + "User authority is：" + authentication.getAuthorities());
	}

	public boolean supports(ConfigAttribute attribute) {
		return true;
	}

	public boolean supports(Class<?> clazz) {
		return true;
	}
}