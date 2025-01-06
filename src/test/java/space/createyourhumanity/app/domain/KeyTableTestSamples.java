package space.createyourhumanity.app.domain;

import java.util.UUID;

public class KeyTableTestSamples {

    public static KeyTable getKeyTableSample1() {
        return new KeyTable().id("id1").key("key1");
    }

    public static KeyTable getKeyTableSample2() {
        return new KeyTable().id("id2").key("key2");
    }

    public static KeyTable getKeyTableRandomSampleGenerator() {
        return new KeyTable().id(UUID.randomUUID().toString()).key(UUID.randomUUID().toString());
    }
}
