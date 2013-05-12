package org.delta.system.service;

import org.delta.core.dao.Dao;
import org.delta.core.dao.Filter;
import org.delta.core.dao.QueryParam;
import org.delta.core.dao.UpdateParam;
import org.delta.core.exception.BusinessException;
import org.delta.core.utils.ValueMap;
import org.apache.commons.collections.MapUtils;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.sql.Timestamp;
import java.util.Date;

/**
 * User: Alex
 * Date: 13-4-18
 * Time: 下午5:03
 */
@Service
public class PwdService {
    @Resource
    private Dao dao;

    public void setPwd(String userId, String newPassword) {
        String enPwd = new Md5PasswordEncoder().encodePassword(newPassword, userId);
        updateEncodedPasswordById(userId, enPwd);
    }

    public void upatePwd(String userId, String oldPassword,String newPassword) {
        ValueMap usr = getUserById(userId);
        String password = MapUtils.getString(usr, "password");
        if(new Md5PasswordEncoder().isPasswordValid(password,oldPassword,userId)){
            String enPwd = new Md5PasswordEncoder().encodePassword(newPassword, userId);
            updateEncodedPasswordById(userId,enPwd);
        }else{
            throw new BusinessException("更新密码时，原始密码错误。");
        }
    }

    private ValueMap getUserById(String userId){
        QueryParam qp = new QueryParam("SYS_USER");
        qp.setFilter(Filter.field("ID").eq(userId));
        return dao.get(qp);
    }

    private void updateEncodedPasswordById(String userId,String enPwd){
        UpdateParam up = new UpdateParam("SYS_USER");
        up.setFilter(Filter.field("ID").eq(userId));
        ValueMap vm = new ValueMap();
        vm.put("password", enPwd);
        vm.put("mdate", new Timestamp(new Date().getTime()));
        up.setColumnValue(vm);
        dao.update(up);
    }
}
