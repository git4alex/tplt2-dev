package org.delta.activiti.form;

import org.activiti.engine.form.StartFormData;
import org.activiti.engine.form.TaskFormData;
import org.activiti.engine.impl.form.FormEngine;
import org.apache.commons.lang.StringUtils;
import org.delta.core.exception.BusinessException;
import org.delta.system.service.ModuleService;

import javax.annotation.Resource;
import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-26
 * Time: 下午11:42
 */
public class TpltFormEngine implements FormEngine {
    @Resource
    private ModuleService moduleService;

    @Override
    public String getName() {
        // return null to overwrite default FormEngine.
        return null;
    }

    @Override
    public Object renderStartForm(StartFormData startForm) {
        String formKey = startForm.getFormKey();
        return getFormCom(formKey);
    }

    @Override
    public Object renderTaskForm(TaskFormData taskForm) {
        String formKey = taskForm.getFormKey();
        return getFormCom(formKey);
    }

    private Map getFormCom(String formKey){
        if(StringUtils.isBlank(formKey)){
            return null;
        }
        String[] comId = formKey.split("\\.");
        if(comId.length != 2){
            throw new BusinessException("parse formkey:"+formKey+" error");
        }
        return moduleService.getComponentConfig(comId[0],comId[1]);
    }
}
