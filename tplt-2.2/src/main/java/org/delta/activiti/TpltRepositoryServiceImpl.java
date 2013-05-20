package org.delta.activiti;

import org.activiti.engine.impl.RepositoryServiceImpl;
import org.apache.commons.lang.ObjectUtils;
import org.springframework.stereotype.Service;

/**
 * User: Alex
 * Date: 13-5-20
 * Time: 下午6:58
 */

@Service
public class TpltRepositoryServiceImpl extends RepositoryServiceImpl {
    public String convertJsonProcess2bpmn20(String jsonDef){
        return ObjectUtils.toString(commandExecutor.execute(new ConvertCmd(jsonDef)));
    }
}
