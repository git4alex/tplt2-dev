package org.delta.system;

import org.codehaus.jackson.JsonGenerator;
import org.codehaus.jackson.JsonProcessingException;
import org.codehaus.jackson.map.JsonSerializer;
import org.codehaus.jackson.map.SerializerProvider;

import java.io.IOException;

public class JsonFunctionSerialzer extends JsonSerializer<JsonFunction> {

    @Override
    public void serialize(JsonFunction value, JsonGenerator jgen, SerializerProvider provider) throws IOException, JsonProcessingException {
        jgen.writeRawValue(value.toString());
    }

}
