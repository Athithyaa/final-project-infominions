from keras.engine import Model

from flask import Flask, render_template, jsonify, request
from keras.models import model_from_json
import os
import json
from keras.datasets import mnist
import numpy as np

base_dir = os.path.dirname(os.path.realpath(__file__))
app = Flask(__name__)
app.config.from_object('config')

(X_train, y_train), (X_test, y_test) = mnist.load_data()
X_test = X_test.astype('float32')
# X_test /= np.max(X_test)
X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], X_test.shape[2], 1)


@app.route('/')
def home():
    return render_template('/layouts/main.html')


@app.route('/predict', methods=['POST'])
def predict():

    # load model json file
    params = json.loads(request.data)
    model_path_name = get_model_path_and_filename(params)
    try:
        json_file = open(model_path_name + "model.json", 'r')
        loaded_model_json = json_file.read()
    except:
        return jsonify(result="invalid json")
    json_file.close()

    # convert json to model and load weights
    loaded_model = model_from_json(loaded_model_json)
    loaded_model.load_weights(model_path_name + "model.h5")
    loaded_model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    test_image_index = np.random.randint(0, len(X_test) - 1)
    test_image = X_test[test_image_index]
    test_image = test_image.reshape(test_image.shape[0], test_image.shape[1])

    result_json = {'layers': {'layer_0': [test_image.tolist()]}}

    conv_layer_num = 0
    relu_layer_num = 0
    maxpool_layer_num = 0
    layer_names = []
    for layer in loaded_model.layers:
        layer_name = str(layer)
        if "Conv2D" in layer_name:
            layer_names.append("conv_{}".format(conv_layer_num))
            conv_layer_num += 1

        elif "MaxPooling2D" in layer_name:
            layer_names.append("maxpool_{}".format(maxpool_layer_num))
            maxpool_layer_num += 1

        elif "Dense" in layer_name and relu_layer_num < params['layers'].count('P'):
            layer_names.append("relu_{}".format(relu_layer_num))
            relu_layer_num += 1

    layer_no = 1
    for layer_name in layer_names:
        conv_layer_model = Model(inputs=loaded_model.input,
                                 outputs=loaded_model.get_layer(layer_name).output)
        conv_layer_out = conv_layer_model.predict(X_test)

        # Find convolution layer depth
        conv_depth = 8

        # Set list of filters in current conv layer
        filters = [conv_layer_out[test_image_index, :, :, filt_id] for filt_id in range(conv_depth)]

        filter_arr = []
        for filter_id, conv_filter in enumerate(filters):
            filter_arr.append(conv_filter.tolist())
        result_json['layers']['layer_'+str(layer_no)] = filter_arr
        layer_no = layer_no + 1
    xx_test = X_test[test_image_index].reshape(1,28,28,1)
    prob = loaded_model.predict(xx_test)

    result_json['probability'] = prob.tolist()
    return jsonify(result=result_json)


def get_model_path_and_filename(params):
    values = [params['noOfFilters'], params['spatialExtent'], params['stride'], params['spatialExtentMp'],
              params['strideMp'], params['layers']]

    folder_name = ''.join(values)
    return base_dir + os.path.sep + 'models' + os.path.sep + folder_name + os.path.sep


@app.errorhandler(500)
def internal_error(error):
    return render_template('errors/500.html'), 500


@app.errorhandler(404)
def not_found_error(error):
    return render_template('errors/404.html'), 404


"""
if not app.debug:
    file_handler = FileHandler('error.log')
    file_handler.setFormatter(
        Formatter('%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]')
    )
    app.logger.setLevel(logging.INFO)
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.info('errors')
"""

# Default port:
if __name__ == '__main__':
    app.run()

# Or specify port manually:
'''
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
'''