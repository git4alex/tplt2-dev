package org.delta.activiti;

import org.activiti.engine.ActivitiException;
import org.activiti.engine.impl.bpmn.deployer.BpmnDeployer;
import org.activiti.engine.impl.context.Context;
import org.activiti.engine.impl.db.DbSqlSession;
import org.activiti.engine.impl.interceptor.CommandContext;
import org.activiti.engine.impl.persistence.entity.DeploymentEntity;
import org.activiti.engine.impl.persistence.entity.ProcessDefinitionEntity;
import org.activiti.engine.impl.persistence.entity.ProcessDefinitionEntityManager;
import org.activiti.engine.impl.persistence.entity.ResourceEntity;
import org.apache.log4j.Logger;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;


/**
 * User: Alex
 * Date: 13-5-11
 * Time: 下午4:10
 */
public class TpltDeployer extends BpmnDeployer {
    private static final Logger logger = Logger.getLogger(TpltDeployer.class);

    public static final String TPLT_PROCESS_DEF="_tplt_process_def";
    public static final String TPLT_PROCESS_SRC="_tplt_process_src";

    public void deploy(DeploymentEntity deployment) {
        logger.debug("Processing deployment :"+ deployment.getName());

        List<ProcessDefinitionEntity> processDefinitions = new ArrayList<ProcessDefinitionEntity>();
        Map<String, ResourceEntity> resources = deployment.getResources();

        for (String resourceName : resources.keySet()) {
            logger.info("Processing resource :"+ resourceName);
            if (isTpltResource(resourceName)) {
                ResourceEntity resource = resources.get(resourceName);
                byte[] bytes = resource.getBytes();
                TpltParse bpmnParse = new TpltParse(new String(bytes));
                bpmnParse.execute();

                processDefinitions = bpmnParse.getProcessDefinitions();
            }
        }

        checkProcessKey(processDefinitions);

        CommandContext commandContext = Context.getCommandContext();
        ProcessDefinitionEntityManager processDefinitionManager = commandContext.getProcessDefinitionEntityManager();

        for (ProcessDefinitionEntity processDefinition : processDefinitions) {
            if (deployment.isNew()) {
                persistProcessDefinition(processDefinition,deployment);
            } else {
                String deploymentId = deployment.getId();
                processDefinition.setDeploymentId(deploymentId);
                ProcessDefinitionEntity persistedProcessDefinition =
                        processDefinitionManager.findProcessDefinitionByDeploymentAndKey(deploymentId, processDefinition.getKey());
                processDefinition.setId(persistedProcessDefinition.getId());
                processDefinition.setVersion(persistedProcessDefinition.getVersion());
                processDefinition.setSuspensionState(persistedProcessDefinition.getSuspensionState());
            }

            // Add to cache
            cacheProcessDefinition(processDefinition);

            // Add to deployment for further usage
            deployment.addDeployedArtifact(processDefinition);
        }
    }

    private void checkProcessKey(List<ProcessDefinitionEntity> processDefinitions){
        // check if there are process definitions with the same process key to prevent database unique index violation
        List<String> keyList = new ArrayList<String>();
        for (ProcessDefinitionEntity processDefinition : processDefinitions) {
            if (keyList.contains(processDefinition.getKey())) {
                throw new ActivitiException("The deployment contains process definitions with the same key (process id atrribute), this is not allowed");
            }
            keyList.add(processDefinition.getKey());
        }
    }

    private void persistProcessDefinition(ProcessDefinitionEntity pd,DeploymentEntity deployment){
        int processDefinitionVersion;
        CommandContext cc = Context.getCommandContext();
        ProcessDefinitionEntity latestProcessDefinition = cc.getProcessDefinitionEntityManager().findLatestProcessDefinitionByKey(pd.getKey());
        if (latestProcessDefinition != null) {
            processDefinitionVersion = latestProcessDefinition.getVersion() + 1;
        } else {
            processDefinitionVersion = 1;
        }

        pd.setVersion(processDefinitionVersion);
        pd.setDeploymentId(deployment.getId());

        String nextId = idGenerator.getNextId();
        String processDefinitionId = pd.getKey()
                + ":" + pd.getVersion()
                + ":" + nextId; // ACT-505

        // ACT-115: maximum id length is 64 charcaters
        if (processDefinitionId.length() > 64) {
            processDefinitionId = nextId;
        }
        pd.setId(processDefinitionId);

        removeObsoleteTimers(pd);
        addTimerDeclarations(pd);

        removeObsoleteMessageEventSubscriptions(pd, latestProcessDefinition);
        addMessageEventSubscriptions(pd);

        cc.getSession(DbSqlSession.class).insert(pd);
        addAuthorizations(pd);
    }

    private void cacheProcessDefinition(ProcessDefinitionEntity processDefinition) {
        Context.getProcessEngineConfiguration()
                .getDeploymentManager()
                .getProcessDefinitionCache()
                .add(processDefinition.getId(), processDefinition);
    }

    private boolean isTpltResource(String resName){
        return TPLT_PROCESS_DEF.equalsIgnoreCase(resName) || TPLT_PROCESS_SRC.equalsIgnoreCase(resName);
    }
}
