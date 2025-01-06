package space.createyourhumanity.app.domain;

import java.util.UUID;

public class UserDetailsTestSamples {

    public static UserDetails getUserDetailsSample1() {
        return new UserDetails().id("id1");
    }

    public static UserDetails getUserDetailsSample2() {
        return new UserDetails().id("id2");
    }

    public static UserDetails getUserDetailsRandomSampleGenerator() {
        return new UserDetails().id(UUID.randomUUID().toString());
    }
}
