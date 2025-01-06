package space.createyourhumanity.app.domain;

import java.io.Serializable;
import java.time.ZonedDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

/**
 * A Friends.
 */
@Document(collection = "friends")
@org.springframework.data.elasticsearch.annotations.Document(indexName = "friends")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Friends implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Field("connect_date")
    private ZonedDateTime connectDate;

    @Field("friend_id")
    @org.springframework.data.elasticsearch.annotations.Field(type = org.springframework.data.elasticsearch.annotations.FieldType.Text)
    private String friendId;

    @DBRef
    @Field("user")
    private User user;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public String getId() {
        return this.id;
    }

    public Friends id(String id) {
        this.setId(id);
        return this;
    }

    public void setId(String id) {
        this.id = id;
    }

    public ZonedDateTime getConnectDate() {
        return this.connectDate;
    }

    public Friends connectDate(ZonedDateTime connectDate) {
        this.setConnectDate(connectDate);
        return this;
    }

    public void setConnectDate(ZonedDateTime connectDate) {
        this.connectDate = connectDate;
    }

    public String getFriendId() {
        return this.friendId;
    }

    public Friends friendId(String friendId) {
        this.setFriendId(friendId);
        return this;
    }

    public void setFriendId(String friendId) {
        this.friendId = friendId;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Friends user(User user) {
        this.setUser(user);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Friends)) {
            return false;
        }
        return getId() != null && getId().equals(((Friends) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Friends{" +
            "id=" + getId() +
            ", connectDate='" + getConnectDate() + "'" +
            ", friendId='" + getFriendId() + "'" +
            "}";
    }
}
