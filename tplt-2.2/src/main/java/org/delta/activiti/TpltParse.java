package org.delta.activiti;

import org.activiti.bpmn.model.parse.Problem;
import org.activiti.engine.ActivitiException;
import org.activiti.engine.impl.bpmn.parser.BpmnParse;
import org.activiti.engine.impl.bpmn.parser.BpmnParser;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

/**
 * User: Alex
 * Date: 13-5-11
 * Time: 下午4:21
 */
public class TpltParse extends BpmnParse {
    public TpltParse(BpmnParser parser) {
        super(parser);
    }

    private String inputStream2String(InputStream is) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        int i = -1;
        while ((i = is.read()) != -1) {
            baos.write(i);
        }
        return baos.toString();
    }

    public TpltParse execute() {
        try {
            BpmnJsonConverter converter = new BpmnJsonConverter();
            String jsonDef = inputStream2String(streamSource.getInputStream());
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
