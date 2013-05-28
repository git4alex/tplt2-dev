package org.delta.activiti;

import org.activiti.bpmn.model.parse.Problem;
import org.activiti.engine.ActivitiException;
import org.activiti.engine.impl.bpmn.parser.BpmnParse;
import org.activiti.engine.impl.bpmn.parser.BpmnParser;

import java.io.*;

/**
 * User: Alex
 * Date: 13-5-11
 * Time: 下午4:21
 */
public class TpltParse extends BpmnParse {
    public TpltParse(BpmnParser parser) {
        super(parser);
    }

    private String readInputStream(InputStream is) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(is,"utf-8"));
        StringBuilder out = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            out.append(line);
        }
        return out.toString();
    }

    public TpltParse execute() {
        try {
            BpmnJsonConverter converter = new BpmnJsonConverter();
            String jsonDef = readInputStream(streamSource.getInputStream());
            bpmnModel = converter.convertToBpmnModel(jsonDef);

            createImports();
            createItemDefinitions();
            createMessages();
            createOperations();
            transformProcessDefinitions();
        } catch (Exception e) {
            if (e instanceof ActivitiException) {
                throw (ActivitiException) e;
            } else {
                throw new ActivitiException("Error parsing JSON:"+e.getMessage(), e);
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
}
