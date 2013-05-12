package org.delta.security;

import java.util.Map;

public interface IUser {
    public int getId();

    public String getName();

    public int getOrgId();

    public Integer getOrgPid();

    public String getOrgCode();

    public String getOrgBizCode();

    public String getOrgName();

    public boolean hasRole(String... roleCodes);

    public boolean hasNoRole(String... roleCodes);

    public boolean hasPerm(String... perms);

    public boolean isSystem();

    public Map<String, Object> getDataMap();

    public User asSystem();
}