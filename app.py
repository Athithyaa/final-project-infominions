from flask import Flask, render_template
from keras.models import model_from_json
import os

base_dir = os.path.dirname(os.path.realpath(__file__))
app = Flask(__name__)
app.config.from_object('config')


@app.route('/')
def home():
    return render_template('/layouts/main.html')


@app.route('/predict/<params>', methods=['POST'])
def predict(params):

    # load model json file
    model_path_name = get_model_path_and_filename(params)
    json_file = open(model_path_name + "model.json", 'r')
    loaded_model_json = json_file.read()
    json_file.close()

    # convert json to model and load weights
    loaded_model = model_from_json(loaded_model_json)
    loaded_model.load_weights(model_path_name + "model.h5")


def get_model_path_and_filename(params):
    values = []
    for key in params.keys():
        values.append(params[key])
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