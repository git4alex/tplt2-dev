package org.delta.activiti;

import org.activiti.engine.impl.bpmn.deployer.BpmnDeployer;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;


/**
 * User: Alex
 * Date: 13-5-11
 * Time: 下午4:10
 */

@Component
public class TpltDeployer extends BpmnDeployer {
    private static final Logger logger = Logger.getLogger(TpltDeployer.class);

    public static final String TPLT_PROCESS_DEF = "_tplt_process_def";
    public static final String TPLT_PROCESS_SRC = "_tplt_process_src";
    public static final String TPLT_PROCESS_BPMN = "_tplt_process_bpmn";

    protected boolean isBpmnResource(String resName) {
        return TPLT_PROCESS_DEF.equalsIgnoreCase(resName);
    }
}
