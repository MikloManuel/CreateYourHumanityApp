package space.createyourhumanity.app.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static space.createyourhumanity.app.domain.FriendsTestSamples.*;

import org.junit.jupiter.api.Test;
import space.createyourhumanity.app.web.rest.TestUtil;

class FriendsTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Friends.class);
        Friends friends1 = getFriendsSample1();
        Friends friends2 = new Friends();
        assertThat(friends1).isNotEqualTo(friends2);

        friends2.setId(friends1.getId());
        assertThat(friends1).isEqualTo(friends2);

        friends2 = getFriendsSample2();
        assertThat(friends1).isNotEqualTo(friends2);
    }
}
