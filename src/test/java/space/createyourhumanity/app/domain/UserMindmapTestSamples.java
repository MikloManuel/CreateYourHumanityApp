package space.createyourhumanity.app.domain;

import java.util.UUID;

public class UserMindmapTestSamples {

    public static UserMindmap getUserMindmapSample1() {
        return new UserMindmap().id("id1").text("text1");
    }

    public static UserMindmap getUserMindmapSample2() {
        return new UserMindmap().id("id2").text("text2");
    }

    public static UserMindmap getUserMindmapRandomSampleGenerator() {
        return new UserMindmap().id(UUID.randomUUID().toString()).text(UUID.randomUUID().toString());
    }
}
