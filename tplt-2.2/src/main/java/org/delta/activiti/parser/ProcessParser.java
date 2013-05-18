package org.delta.activiti.parser;

import org.activiti.bpmn.converter.util.BpmnXMLUtil;
import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.Process;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.delta.activiti.BpmnJsonParser;
import org.springframework.util.Assert;

import java.util.List;
import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-17
 * Time: 下午5:53
 */
public class ProcessParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"process"};
    }

    @Override
    public Process doParse(Map jsonMap, BaseElement parent,BpmnModel bpmnModel) {
        String id = MapUtils.getString(jsonMap,ATTRIBUTE_ID);
        Assert.isNull(id,"process id must not be null");

        Process process = new Process();
        process.setId(id);

        String name = MapUtils.getString(jsonMap,ATTRIBUTE_NAME);
        Assert.isNull(id,"process name must not be null");
        process.setName(name);

        boolean executable = MapUtils.getBoolean(jsonMap,ATTRIBUTE_PROCESS_EXECUTABLE,false);
        process.setExecutable(executable);

        String cUsers = MapUtils.getString(jsonMap,ATTRIBUTE_PROCESS_CANDIDATE_USERS);
        if(StringUtils.isNotBlank(cUsers)){
            List<String> candidateUsers = BpmnXMLUtil.parseDelimitedList(cUsers);
            process.setCandidateStarterUsers(candidateUsers);
        }

        String cGroups = MapUtils.getString(jsonMap,ATTRIBUTE_TASK_USER_CANDIDATEGROUPS);
        if(StringUtils.isNotBlank(cGroups)){
            List<String> candidateGroups = BpmnXMLUtil.parseDelimitedList(cGroups);
            process.setCandidateStarterUsers(candidateGroups);
        }

        if(process.isExecutable()){
            bpmnModel.getProcesses().add(process);
        }

        jsonMap.put("parent",process);

        return process;
    }
}
