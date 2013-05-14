package org.delta.activiti;

import org.activiti.bpmn.constants.BpmnXMLConstants;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.parse.Problem;
import org.activiti.engine.ActivitiException;
import org.activiti.engine.impl.persistence.entity.ProcessDefinitionEntity;

import java.util.ArrayList;
import java.util.List;

/**
 * User: Alex
 * Date: 13-5-11
 * Time: 下午4:21
 */
public class TpltParse implements BpmnXMLConstants {

    private String jsonDef;
    protected BpmnModel bpmnModel;
    protected List<ProcessDefinitionEntity> processDefinitions = new ArrayList<ProcessDefinitionEntity>();

    public TpltParse(String jsonDef){
        this.jsonDef = jsonDef;
    }

    public TpltParse execute() {
        try {
            BpmnJSONConverter converter = new BpmnJSONConverter();

            bpmnModel = converter.convertToBpmnModel(this.jsonDef);

//            createImports();
//            createItemDefinitions();
//            createMessages();
//            createOperations();
//            transformProcessDefinitions();
        } catch (Exception e) {
            if (e instanceof ActivitiException) {
                throw (ActivitiException) e;
            } else {
                throw new ActivitiException("Error parsing JSON", e);
            }
        }

        if (bpmnModel.getProblems().size() > 0) {
            StringBuilder problemBuilder = new StringBuilder();
            for (Problem error : bpmnModel.getProblems()) {
                problemBuilder.append(error.toString());
                problemBuilder.append("\n");
            }
            throw new ActivitiException("Errors while parsing:\n" + problemBuilder.toString());
        }

        return this;
    }

    public List<ProcessDefinitionEntity> getProcessDefinitions() {
        return processDefinitions;
    }
}
