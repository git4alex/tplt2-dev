package org.delta.activiti.parser;

import org.activiti.bpmn.converter.util.BpmnXMLUtil;
import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.UserTask;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.delta.activiti.BpmnJsonParser;

import java.util.List;
import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-18
 * Time: 下午9:29
 */
public class UserTaskParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"usertask"};
    }

    @Override
    public UserTask doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        UserTask task = new UserTask();
        String dueDate = MapUtils.getString(jsonMap, ATTRIBUTE_TASK_USER_DUEDATE);
        task.setDueDate(dueDate);
        String formKey = MapUtils.getString(jsonMap, ATTRIBUTE_FORM_FORMKEY);
        task.setFormKey(formKey);
        String assignee = MapUtils.getString(jsonMap, ATTRIBUTE_TASK_USER_ASSIGNEE);
        task.setAssignee(assignee);
        String priority = MapUtils.getString(jsonMap, ATTRIBUTE_TASK_USER_PRIORITY);
        task.setPriority(priority);
        String candidateUsers = MapUtils.getString(jsonMap, ATTRIBUTE_TASK_USER_CANDIDATEUSERS);
        if (StringUtils.isNotBlank(candidateUsers)) {
            task.getCandidateUsers().addAll(BpmnXMLUtil.parseDelimitedList(candidateUsers));
        }
        String candidateGroups = MapUtils.getString(jsonMap, ATTRIBUTE_TASK_USER_CANDIDATEGROUPS);
        if (StringUtils.isNotBlank(candidateGroups)) {
            task.getCandidateUsers().addAll(BpmnXMLUtil.parseDelimitedList(candidateGroups));
        }

        List taskListeners = (List) MapUtils.getObject(jsonMap, "taskListeners");
        if (CollectionUtils.isNotEmpty(taskListeners)) {
            for (Object item : taskListeners) {
                Map itemMap = (Map) item;
                task.getTaskListeners().add(parseListener(itemMap));
            }
        }

        return task;
    }
}
