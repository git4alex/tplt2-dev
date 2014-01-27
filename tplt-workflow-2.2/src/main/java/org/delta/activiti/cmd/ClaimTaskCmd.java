package org.delta.activiti.cmd;

import org.activiti.engine.impl.interceptor.CommandContext;
import org.activiti.engine.impl.persistence.entity.TaskEntity;
import org.activiti.engine.task.IdentityLink;
import org.springframework.util.Assert;

import java.util.Set;

/**
 * User: Alex
 * Date: 13-5-31
 * Time: 下午11:38
 */
public class ClaimTaskCmd extends org.activiti.engine.impl.cmd.ClaimTaskCmd {
    public ClaimTaskCmd(String taskId, String userId) {
        super(taskId,userId);
    }
    @Override
    protected Void execute(CommandContext commandContext, TaskEntity task) {
        Set<IdentityLink> candidates = task.getCandidates();
        boolean isCandidate=false;
        for(IdentityLink candidate:candidates){
            candidate.getUserId().equalsIgnoreCase(this.userId);
            isCandidate=true;
            break;
        }
        Assert.isTrue(isCandidate,"userId not in cadidateUsers");

        return super.execute(commandContext,task);
    }
}
