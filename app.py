from flask import Flask, render_template

app = Flask(__name__)
app.config.from_object('config')


@app.route('/')
def home():
    return render_template('/layouts/main.html')


@app.errorhandler(500)
def internal_error():
    return render_template('errors/500.html'), 500


@app.errorhandler(404)
def not_found_error():
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