package space.createyourhumanity.app.domain;

import java.util.UUID;

public class FriendrequestTestSamples {

    public static Friendrequest getFriendrequestSample1() {
        return new Friendrequest().id("id1").requestUserId("requestUserId1");
    }

    public static Friendrequest getFriendrequestSample2() {
        return new Friendrequest().id("id2").requestUserId("requestUserId2");
    }

    public static Friendrequest getFriendrequestRandomSampleGenerator() {
        return new Friendrequest().id(UUID.randomUUID().toString()).requestUserId(UUID.randomUUID().toString());
    }
}
