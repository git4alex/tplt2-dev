package org.delta.activiti.parser;

import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.ScriptTask;
import org.apache.commons.collections.MapUtils;
import org.delta.activiti.BpmnJsonParser;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-19
 * Time: 下午7:56
 */
public class ScriptTaskPaser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"scripttask"};
    }

    @Override
    protected BaseElement doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        ScriptTask scriptTask = new ScriptTask();
        scriptTask.setScriptFormat(MapUtils.getString(jsonMap,ATTRIBUTE_TASK_SCRIPT_FORMAT));
        scriptTask.setResultVariable(MapUtils.getString(jsonMap,ATTRIBUTE_TASK_SCRIPT_RESULTVARIABLE));
        scriptTask.setScript(MapUtils.getString(jsonMap,ATTRIBUTE_TASK_SCRIPT_TEXT));

        if(jsonMap.containsKey(ATTRIBUTE_TASK_SCRIPT_AUTO_STORE_VARIABLE)){
            scriptTask.setAutoStoreVariables(MapUtils.getBoolean(jsonMap,ATTRIBUTE_TASK_SCRIPT_AUTO_STORE_VARIABLE));
        }

        return scriptTask;
    }
}
