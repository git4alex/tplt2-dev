package org.delta.system;

import org.codehaus.jackson.map.annotate.JsonSerialize;

import java.util.ArrayList;
import java.util.List;

@JsonSerialize(using = JsonFunctionSerialzer.class)
public class JsonFunction {
    public static final boolean IS_DEBUG_ENABLE = true;

    private String body;
    private List<String> params = new ArrayList<String>();

    public JsonFunction(String body) {
        this.body = body;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public List<String> getParams() {
        return params;
    }

    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("function(");
        sb.append(params.toString().substring(1).replace("]", ""));
        sb.append("){");
        if(IS_DEBUG_ENABLE){
        sb.append("\n" +
                "if(od.DEBUG_ENABLE){\n" +
                "\tdebugger;\n" +
                "}\n");
        }
        sb.append(body);
        sb.append("}");
        return sb.toString();
    }
}
