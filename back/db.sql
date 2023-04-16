CREATE TYPE user_type AS ENUM ('email', 'ft');
CREATE TYPE chann_type AS ENUM ('public', 'private', 'password');
CREATE TYPE chann_action_type AS ENUM ('ban', 'mute');

CREATE TABLE user_ (
	id			bigint UNIQUE,
    user_type   user_type NOT NULL,
	username	varchar NOT NULL,
	pp			text,
	ft_token	varchar,
    pass_hash   varchar,
	elo			int DEFAULT 1000,
	PRIMARY KEY(id)
);

CREATE TABLE user_friend_ (
	user_id		bigint,
	friend_id	bigint,
	CONSTRAINT fk_user
		FOREIGN KEY(user_id) 
			REFERENCES user_(id),
	CONSTRAINT fk_friend
		FOREIGN KEY(friend_id) 
			REFERENCES user_(id)
);

CREATE TABLE user_block_ (
	user_id		bigint,
	block_id	bigint,
	CONSTRAINT fk_user
		FOREIGN KEY(user_id) 
			REFERENCES user_(id),
	CONSTRAINT fk_block
		FOREIGN KEY(block_id) 
			REFERENCES user_(id)
);

CREATE TABLE user_history_ (
    user_id     bigint,
    opponent_id bigint,
    win         boolean,
    elo_diff    int,
    date_time   timestamp,
    CONSTRAINT  fk_user
        FOREIGN KEY(user_id)
            REFERENCES user_(id),
    CONSTRAINT  fk_opponent
        FOREIGN KEY(opponent_id)
            REFERENCES user_(id)
);

CREATE TABLE channel_ (
    id          bigint,
    owner_id    bigint NOT NULL,
    chann_type  chann_type NOT NULL,
    pass_hash   varchar,
    user_count  int NOT NULL DEFAULT 1,
    CONSTRAINT  fk_owner
        FOREIGN KEY(owner_id)
            REFERENCES user_(id),
    PRIMARY KEY(id)
);

CREATE TABLE channel_user_ (
    chann_id    bigint,
    user_id     bigint,
    is_admin    boolean DEFAULT false,
    joined      timestamp,
    CONSTRAINT  fk_chan
        FOREIGN KEY(chann_id)
            REFERENCES channel_(id),
    CONSTRAINT  fk_user
        FOREIGN KEY(user_id)
            REFERENCES user_(id)
);

CREATE TABLE channel_invite_ (
    chann_id    bigint,
    user_id     bigint,
    CONSTRAINT  fk_chan
        FOREIGN KEY(chann_id)
            REFERENCES channel_(id),
    CONSTRAINT  fk_user
        FOREIGN KEY(user_id)
            REFERENCES user_(id)
);

CREATE TABLE channel_action_ (
    chann_id    bigint,
    user_id     bigint,
    action_type chann_action_type NOT NULL,
    until       timestamp,
    CONSTRAINT  fk_chan
        FOREIGN KEY(chann_id)
            REFERENCES channel_(id),
    CONSTRAINT  fk_user
        FOREIGN KEY(user_id)
            REFERENCES user_(id)
);

CREATE TABLE channel_message_ (
    chann_id    bigint,
    user_id     bigint,
    user_message text,
    date_time   timestamp,
    CONSTRAINT  fk_chan
        FOREIGN KEY(chann_id)
            REFERENCES channel_(id),
    CONSTRAINT  fk_user
        FOREIGN KEY(user_id)
            REFERENCES user_(id)
);