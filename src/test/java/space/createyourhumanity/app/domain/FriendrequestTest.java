package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.FriendrequestTestSamples.*;

import org.junit.jupiter.api.Test;
import space.createyourhumanity.app.web.rest.TestUtil;

class FriendrequestTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Friendrequest.class);
        Friendrequest friendrequest1 = getFriendrequestSample1();
        Friendrequest friendrequest2 = new Friendrequest();
        assertThat(friendrequest1).isNotEqualTo(friendrequest2);

        friendrequest2.setId(friendrequest1.getId());
        assertThat(friendrequest1).isEqualTo(friendrequest2);

        friendrequest2 = getFriendrequestSample2();
        assertThat(friendrequest1).isNotEqualTo(friendrequest2);
    }
}
