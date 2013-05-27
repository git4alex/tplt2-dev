package org.delta.activiti.form;

import org.activiti.engine.form.StartFormData;
import org.activiti.engine.form.TaskFormData;
import org.activiti.engine.impl.form.FormEngine;

/**
 * User: Alex
 * Date: 13-5-26
 * Time: 下午11:42
 */
public class TpltFormEngine implements FormEngine {
    @Override
    public String getName() {
        // return null to overwrite default FormEngine.
        return null;
    }

    @Override
    public Object renderStartForm(StartFormData startForm) {
        return null;
    }

    @Override
    public Object renderTaskForm(TaskFormData taskForm) {
        return null;
    }
}
