from tensorflow.keras.models import Model
from tensorflow.keras.layers import Input, Dense
from tensorflow.keras.optimizers import Adam


def build_autoencoder(input_dim):

    input_layer = Input(shape=(input_dim,))

    encoder = Dense(16, activation="relu")(input_layer)
    encoder = Dense(8, activation="relu")(encoder)

    decoder = Dense(16, activation="relu")(encoder)
    decoder = Dense(input_dim, activation="linear")(decoder)

    autoencoder = Model(inputs=input_layer, outputs=decoder)
    autoencoder.compile(
        optimizer=Adam(learning_rate=0.001),
        loss="mse"
    )

    return autoencoder
