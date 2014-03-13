package org.delta.security;

import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.delta.utils.AntUrlPathMatcher;
import org.springframework.jdbc.object.MappingSqlQuery;
import org.springframework.security.access.ConfigAttribute;
import org.springframework.security.access.SecurityConfig;
import org.springframework.security.web.FilterInvocation;
import org.springframework.security.web.access.intercept.FilterInvocationSecurityMetadataSource;

import javax.sql.DataSource;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;

public class SecurityMetadataSource implements	FilterInvocationSecurityMetadataSource {

	private static final Logger logger = Logger.getLogger(SecurityMetadataSource.class);

	private DataSource dataSource;
	private String resourceQuery;
	private AntUrlPathMatcher urlMatcher = new AntUrlPathMatcher();
	private static Map<String, Collection<ConfigAttribute>> resourceMap = new LinkedHashMap<>();

	public SecurityMetadataSource(DataSource dataSource, String resourceQuery) {
		this.dataSource = dataSource;
		this.resourceQuery = resourceQuery;
		loadResourceDefine();
	}

	private void loadResourceDefine() {
		if (logger.isDebugEnabled()) {
			logger.debug("load resource defination begin ......");
		}

		List<Resource> resources = new ResourceQuery(dataSource,resourceQuery).execute();

		for (Resource resource : resources) {
			String us=resource.getUrls();
			if(StringUtils.isBlank(us)){
				continue;
			}

			us=us.replaceAll("\n", "");
			String[] urls = us.split(";");
			String code=resource.getCode();

			if(StringUtils.isNotBlank(code) && !ArrayUtils.isEmpty(urls)){
				for(String url:urls){
					if(StringUtils.isBlank(url)){
						continue;
					}

					if(!url.contains("@")){
						url="ALL@"+url;
					}

					Collection<ConfigAttribute> configAttrs = resourceMap.get(url);
					if(configAttrs==null){
						configAttrs=new ArrayList<>();
						resourceMap.put(url, configAttrs);
					}

					configAttrs.add(new SecurityConfig(code));
				}
			}
		}

		if (logger.isDebugEnabled()) {
			logger.debug("load resource defination complated ......");
		}
	}

	public Collection<ConfigAttribute> getAttributes(Object object)	throws IllegalArgumentException {
		String reqUrl = ((FilterInvocation) object).getRequest().getRequestURI();
		String method=((FilterInvocation) object).getRequest().getMethod();

		Iterator<String> ite = resourceMap.keySet().iterator();
		Collection<ConfigAttribute> ret= new ArrayList<>();

		while (ite.hasNext()) {
			String resURL = ite.next();
			String resPath=resURL;
			String url=reqUrl;
			if(resPath.startsWith("ALL@")){
				resPath=resPath.substring(4);
			}else{
				url=method+"@"+url;
			}

			if (urlMatcher.pathMatchesUrl(resPath, url)) {
				Collection<ConfigAttribute> returnCollection = resourceMap.get(resURL);
				ret.addAll(returnCollection);
			}
		}

		return ret;
	}

	public boolean supports(Class<?> clazz) {
		return true;
	}

	public Collection<ConfigAttribute> getAllConfigAttributes() {
		return null;
	}

	private class Resource {
		private String urls;
		private String code;
		public Resource(String urls, String code) {
			this.urls = urls;
			this.code = code;
		}

		public String getUrls() {
			return urls;
		}

		public String getCode() {
			return code;
		}

	}

	private class ResourceQuery extends MappingSqlQuery<Resource> {
		protected ResourceQuery(DataSource dataSource, String resourceQuery) {
			super(dataSource, resourceQuery);
			compile();
		}

		protected Resource mapRow(ResultSet rs, int rownum) throws SQLException {
			String urls = rs.getString("urls");
			String code = StringUtils.defaultString(rs.getString("code"));

            return new Resource(urls,code);
		}
	}
}