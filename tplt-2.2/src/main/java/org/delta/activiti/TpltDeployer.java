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

import java.io.ByteArrayInputStream;
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
                ByteArrayInputStream inputStream = new ByteArrayInputStream(bytes);

                TpltParse bpmnParse = new TpltParse();
                bpmnParse.execute();

                for (ProcessDefinitionEntity processDefinition: bpmnParse.getProcessDefinitions()) {
//                    processDefinition.setResourceName(resourceName);
//
//                    String diagramResourceName = getDiagramResourceForProcess(resourceName, processDefinition.getKey(), resources);
//
//                    // Only generate the resource when deployment is new to prevent modification of deployment resources
//                    // after the process-definition is actually deployed. Also to prevent resource-generation failure every
//                    // time the process definition is added to the deployment-cache when diagram-generation has failed the first time.
//                    if(deployment.isNew()) {
//                        if (Context.getProcessEngineConfiguration().isCreateDiagramOnDeploy() &&
//                                diagramResourceName==null && processDefinition.isGraphicalNotationDefined()) {
//                            try {
//                                byte[] diagramBytes = IoUtil.readInputStream(ProcessDiagramGenerator.generatePngDiagram(bpmnParse.getBpmnModel()), null);
//                                diagramResourceName = getProcessImageResourceName(resourceName, processDefinition.getKey(), "png");
//                                createResource(diagramResourceName, diagramBytes, deployment);
//                            } catch (Throwable t) { // if anything goes wrong, we don't store the image (the process will still be executable).
//                                logger.warn("Error while generating process diagram, image will not be stored in repository", t);
//                            }
//                        }
//                    }
//
//                    processDefinition.setDiagramResourceName(diagramResourceName);
                    processDefinitions.add(processDefinition);
                }
            }
        }

        // check if there are process definitions with the same process key to prevent database unique index violation
        List<String> keyList = new ArrayList<String>();
        for (ProcessDefinitionEntity processDefinition : processDefinitions) {
            if (keyList.contains(processDefinition.getKey())) {
                throw new ActivitiException("The deployment contains process definitions with the same key (process id atrribute), this is not allowed");
            }
            keyList.add(processDefinition.getKey());
        }

        CommandContext commandContext = Context.getCommandContext();
        ProcessDefinitionEntityManager processDefinitionManager = commandContext.getProcessDefinitionEntityManager();
        DbSqlSession dbSqlSession = commandContext.getSession(DbSqlSession.class);
        for (ProcessDefinitionEntity processDefinition : processDefinitions) {

            if (deployment.isNew()) {
                int processDefinitionVersion;

                ProcessDefinitionEntity latestProcessDefinition = processDefinitionManager.findLatestProcessDefinitionByKey(processDefinition.getKey());
                if (latestProcessDefinition != null) {
                    processDefinitionVersion = latestProcessDefinition.getVersion() + 1;
                } else {
                    processDefinitionVersion = 1;
                }

                processDefinition.setVersion(processDefinitionVersion);
                processDefinition.setDeploymentId(deployment.getId());

                String nextId = idGenerator.getNextId();
                String processDefinitionId = processDefinition.getKey()
                        + ":" + processDefinition.getVersion()
                        + ":" + nextId; // ACT-505

                // ACT-115: maximum id length is 64 charcaters
                if (processDefinitionId.length() > 64) {
                    processDefinitionId = nextId;
                }
                processDefinition.setId(processDefinitionId);

                removeObsoleteTimers(processDefinition);
                addTimerDeclarations(processDefinition);

                removeObsoleteMessageEventSubscriptions(processDefinition, latestProcessDefinition);
                addMessageEventSubscriptions(processDefinition);

                dbSqlSession.insert(processDefinition);
                addAuthorizations(processDefinition);


            } else {
                String deploymentId = deployment.getId();
                processDefinition.setDeploymentId(deploymentId);
                ProcessDefinitionEntity persistedProcessDefinition = processDefinitionManager.findProcessDefinitionByDeploymentAndKey(deploymentId, processDefinition.getKey());
                processDefinition.setId(persistedProcessDefinition.getId());
                processDefinition.setVersion(persistedProcessDefinition.getVersion());
                processDefinition.setSuspensionState(persistedProcessDefinition.getSuspensionState());
            }

            // Add to cache
            Context
                    .getProcessEngineConfiguration()
                    .getDeploymentManager()
                    .getProcessDefinitionCache()
                    .add(processDefinition.getId(), processDefinition);

            // Add to deployment for further usage
            deployment.addDeployedArtifact(processDefinition);
        }
    }

    private boolean isTpltResource(String resName){
        return TPLT_PROCESS_DEF.equalsIgnoreCase(resName) || TPLT_PROCESS_SRC.equalsIgnoreCase(resName);
    }
}
