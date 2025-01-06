package space.createyourhumanity.app.domain;

import java.util.UUID;

public class FriendsTestSamples {

    public static Friends getFriendsSample1() {
        return new Friends().id("id1").friendId("friendId1");
    }

    public static Friends getFriendsSample2() {
        return new Friends().id("id2").friendId("friendId2");
    }

    public static Friends getFriendsRandomSampleGenerator() {
        return new Friends().id(UUID.randomUUID().toString()).friendId(UUID.randomUUID().toString());
    }
}
